import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.service';
import {
  IParagraphReady,
  ICharacterState,
  IWordState,
  WordState,
  CharState
} from '../interfaces';

@Component({
  selector: 'app-game-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-dashboard.html',
  styleUrl: './game-dashboard.scss',
})
export class GameDashboard implements OnInit, OnDestroy {

//Hidden textarea reference. We never show it to the user, but it captures all keyboard input.
  
  @ViewChild('typingInput') typingInput!: ElementRef<HTMLTextAreaElement>;

  // Countdown timer before the game starts 
  time = signal(10);

  //Game lifecycle flags 
  gameStarted = signal(false);
  paragraphLoaded = signal(false);
  isFinished = signal(false);

  /**
   * Word-based typing state
   * Each word contains characters
   * UI highlights the word, not individual characters
   */
  wordStates = signal<IWordState[]>([]);
  currentWordIndex = signal(0);     // Which word user is typing
  charIndexInWord = signal(0);      // Which character inside that word

  //Metrics for stats calculation 
  correctCount = signal(0);
  totalErrors = signal(0);
  startTime = signal<number | null>(null);

  //Final calculated results 
  wpm = signal(0);
  timeTakenSeconds = signal(0);

  constructor(private socket: SocketService) { }

  /**
   * Component initialization:
   * 1. Start countdown
   * 2. Listen for paragraph from backend
   */
  ngOnInit(): void {
    this.startCountdown();
    this.listenForParagraph();
  }

// Listens for "paragraph-ready" event from backend. Converts paragraph string into:   word[] -> char[]
   
  private listenForParagraph(): void {
    this.socket.on('paragraph-ready', (data: IParagraphReady) => {

      // Split paragraph into words and prepare typing state
      const words: IWordState[] = data.paragraph.split(' ').map((word, i) => ({
        word,
        state: (i === 0 ? 'active' : 'pending') as WordState,
        chars: word.split('').map(c => ({
          char: c,
          state: 'pending' as CharState
        }) as ICharacterState),
      }));

      // Initialize typing engine
      this.wordStates.set(words);
      this.paragraphLoaded.set(true);
      this.gameStarted.set(true);

      // Focus input after DOM render
      setTimeout(() => this.typingInput.nativeElement.focus(), 100);
    });
  }

  // Handles every keystroke. We only care about the last typed character.
   
  onInput(event: Event): void {
    if (this.isFinished()) return;

    // Start timer on first valid key press
    if (!this.startTime()) {
      this.startTime.set(Date.now());
    }

    const input = event.target as HTMLTextAreaElement;
    const typedChar = input.value.slice(-1);
    input.value = '';

    const words = this.wordStates();
    const wIndex = this.currentWordIndex();
    const cIndex = this.charIndexInWord();

    const currentWord = words[wIndex];
    const expectedChar = currentWord.chars[cIndex]?.char;

    if (!typedChar || !expectedChar) return;

    // Correct character typed
    if (typedChar === expectedChar) {
      currentWord.chars[cIndex].state = 'correct' as CharState;
      this.correctCount.update(v => v + 1);
      this.charIndexInWord.set(cIndex + 1);

      // Word completed → move to next word
      if (cIndex + 1 === currentWord.chars.length) {
        currentWord.state = 'completed' as WordState;
        this.currentWordIndex.set(wIndex + 1);
        this.charIndexInWord.set(0);

        // Activate next word or finish game
        if (words[wIndex + 1]) {
          words[wIndex + 1].state = 'active' as WordState;
        } else {
          this.handleCompletion();
        }
      }
    }
    // Incorrect character typed
    else {
      currentWord.chars[cIndex].state = 'incorrect' as CharState;
      this.totalErrors.update(v => v + 1);
    }

    // Trigger UI update
    this.wordStates.set([...words]);
  }

  //Disable backspace to keep typing flow strict.
  //and user will not move forward until correct char is typed and if wrong typed total errors increases.
   
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
    }
  }

   //Called once the last word is completed. Calculates WPM, accuracy and sends stats to backend.
  private handleCompletion(): void {
    this.isFinished.set(true);

    const endTime = Date.now();
    const start = this.startTime() ?? endTime;

    const durationMinutes = (endTime - start) / 60000;
    const timeSeconds = Math.floor((endTime - start) / 1000);

    // WPM = (correct chars / 5) / minutes
    const wpm =
      durationMinutes > 0
        ? Math.round((this.correctCount() / 5) / durationMinutes)
        : 0;

    this.wpm.set(wpm);
    this.timeTakenSeconds.set(timeSeconds);

    // Accuracy = correct / (correct + total mistakes)
    const accuracy =
      this.correctCount() + this.totalErrors() > 0
        ? Math.round(
          (this.correctCount() /
            (this.correctCount() + this.totalErrors())) * 100
        )
        : 0;

    // Notify backend
    this.socket.emit('player-finished', {
      stats: {
        wpm,
        accuracy,
        correctChars: this.correctCount(),
        totalMistakes: this.totalErrors(),
        timeTakenSeconds: timeSeconds,
      },
    });
  }

  
  // Pre-game countdown logic. Game begins when timer reaches zero.

  startCountdown(): void {
    const timer = setInterval(() => {
      this.time.update(t => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  //   Cleanup socket listeners on component destroy
   
  ngOnDestroy(): void {
    this.socket.off('paragraph-ready');
  }
}
