import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}


@Component({
  selector: 'app-homepage',
  imports: [CommonModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css'],
})

export class Homepage implements OnInit {
  user = signal<User | null>(null);
  showDetails = signal(false);
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    //user authentication check
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    //user load 
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user.set(currentUser);
    } else {
      this.fetchUserProfile();
    }
  }


  fetchUserProfile() {
    this.isLoading.set(true);
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data.user) {
          this.user.set(response.data.user);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching user profile:', error);
        this.authService.logout();
      }
    });
  }


  toggleDetails() {
    this.showDetails.set(!this.showDetails());
  }

  onLogout() {
    if (confirm('Are you sure you want to logout?'))
      this.authService.logout();
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

}
