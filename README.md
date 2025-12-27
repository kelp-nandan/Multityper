# 🚀 Multi-Typer: Real-Time Multiplayer Typing Game

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

*A competitive real-time multiplayer typing game with live progress tracking, secure authentication, and interactive gameplay*

[🎮 Demo](#demo) • [🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🛠 Tech Stack](#tech-stack)

</div>

---

## 🎯 Project Overview

**Multi-Typer** is a competitive real-time multiplayer typing game that brings the excitement of speed typing competitions to the web. Players can create or join typing rooms, compete against friends in real-time, and track their performance with detailed analytics.

### ✨ Key Features

- **🏁 Real-Time Competition**: Live multiplayer typing races with instant progress tracking
- **📊 Live Analytics**: Real-time WPM, accuracy, and progress monitoring
- **🎮 Interactive Gameplay**: Dynamic character-by-character feedback with visual indicators
- **🔒 Secure Authentication**: JWT-based auth with HTTP-only cookies and bcrypt encryption
- **🏆 Leaderboards**: Comprehensive ranking system with detailed performance metrics
- **🎨 Modern UI/UX**: Responsive design with beautiful animations and visual feedback
- **⚡ High Performance**: WebSocket-powered real-time communication with Redis caching

---

## 🎮 Gameplay Features

### 🏠 Room Management
- **Create Private Rooms**: Host custom typing competitions with friends
- **Join Existing Rooms**: Browse and join active typing sessions
- **Real-Time Lobby**: See players joining/leaving in real-time
- **Creator Controls**: Start games, manage participants, and room settings

### 🏃‍♂️ Live Typing Experience
- **Character-Level Feedback**: Instant visual feedback for each keystroke
- **Real-Time Progress**: Live WPM, accuracy, and completion tracking
- **Mistake Tracking**: Detailed error analysis with visual indicators
- **Dynamic Difficulty**: Varied paragraph content for different skill levels

### 📈 Performance Analytics
- **Words Per Minute (WPM)**: Real-time speed calculation
- **Accuracy Percentage**: Precision tracking with mistake analysis
- **Completion Time**: Race duration and timing statistics
- **Progress Visualization**: Live progress bars and completion status

---

## 🏗 System Architecture

### 🌐 Frontend (Angular 18)
- **Component-Based Architecture**: Modular, reusable UI components
- **Real-Time Updates**: Socket.io integration for instant game updates
- **State Management**: Signal-based reactive state management
- **Route Guards**: Protected routes with authentication validation
- **Responsive Design**: Mobile-first responsive UI with SCSS styling

### ⚙️ Backend (NestJS)
- **WebSocket Gateway**: Real-time bidirectional communication
- **JWT Authentication**: Secure token-based authentication system
- **Database Integration**: PostgreSQL with Sequelize ORM
- **Redis Caching**: High-performance session and game state management
- **Input Validation**: Comprehensive data validation and sanitization

### 🗄 Database Design
- **Users Table**: Secure user credentials and profile management
- **Paragraphs Table**: Typing content with difficulty variations
- **Session Management**: Redis-based real-time game state storage

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** 18+ 
- **Docker & Docker Compose**
- **PostgreSQL** 13+
- **Redis** 6+ (via Docker)

### 🔧 Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/kelp-nandan/multityper.git
   cd multityper
   ```

2. **Start Infrastructure**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Run database migrations
   npm run db:migrate
   
   # Start development server
   npm run start:dev
   ```

4. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Start Angular development server
   npm start
   ```

5. **Access Application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:3000
   - **WebSocket**: ws://localhost:3000


---

## 🛠 Tech Stack

### Frontend Stack
- **Framework**: Angular 18 with Standalone Components
- **Language**: TypeScript 5.9+
- **Styling**: SCSS with CSS Custom Properties
- **Real-Time**: Socket.io Client
- **HTTP Client**: Angular HttpClient with Interceptors
- **Routing**: Angular Router with Guards
- **State Management**: Angular Signals

### Backend Stack
- **Framework**: NestJS 11 with TypeScript
- **Authentication**: JWT with Passport.js
- **WebSocket**: Socket.io with NestJS WebSocket Gateway
- **Database**: PostgreSQL 13+ with Sequelize ORM
- **Caching**: Redis 6+ for session management
- **Security**: bcrypt, crypto-js, CORS protection
- **Validation**: class-validator and class-transformer

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Sequelize CLI
- **Code Formatting**: Prettier
- **Linting**: ESLint with TypeScript rules
- **Process Management**: PM2 (production)

---

## 📁 Project Structure

```
multityper/
├── 🎨 client/                    # Angular Frontend Application
│   ├── src/app/
│   │   ├── 🎮 game-dashboard/    # Real-time typing interface
│   │   ├── 🏠 gamelobby/         # Room management and lobby
│   │   ├── 🏆 leaderboard/       # Performance rankings
│   │   ├── 🔐 identity/          # Authentication system
│   │   │   ├── guards/           # Route protection
│   │   │   ├── services/         # Auth service
│   │   │   └── interceptors/     # HTTP interceptors
│   │   ├── 🌐 services/          # Core services
│   │   └── 🎯 interfaces/        # TypeScript interfaces
│   └── 🎨 styles/                # Global SCSS styles
├── ⚙️ server/                    # NestJS Backend Application
│   ├── src/
│   │   ├── 🔐 auth/              # JWT authentication
│   │   ├── 👥 users/             # User management
│   │   ├── 🏠 rooms/             # WebSocket room management
│   │   ├── 📝 paragraph/         # Typing content management
│   │   ├── 🔴 redis/             # Redis integration
│   │   ├── 🗄 database/          # Database repositories
│   │   └── ⚙️ config/            # Configuration management
│   └── 📊 migrations/            # Database migrations
└── 🐳 docker-compose.yml         # Infrastructure setup
```

---

## 🔐 Security Features

### 🛡 Authentication & Authorization
- **Dual-Layer Security**: SHA-256 frontend hashing + bcrypt backend encryption
- **JWT Tokens**: Access/refresh token mechanism with secure rotation
- **HTTP-Only Cookies**: XSS-resistant token storage
- **Route Guards**: Frontend and backend route protection
- **Session Management**: Automatic token refresh and logout

### 🔒 Data Protection
- **Input Validation**: Comprehensive client and server-side validation
- **SQL Injection Prevention**: Parameterized queries with Sequelize ORM
- **CORS Protection**: Configured cross-origin resource sharing
- **Rate Limiting**: API endpoint protection against abuse
- **Environment Variables**: Sensitive configuration management

---

## 🎮 Game Flow

1. **👤 Authentication**: Secure login with JWT tokens
2. **🏠 Lobby Selection**: Browse or create typing rooms
3. **🎯 Room Joining**: Real-time player management and room status
4. **⏱ Game Countdown**: Synchronized start countdown for all players
5. **🏃‍♂️ Live Typing**: Real-time character-by-character feedback
6. **📊 Progress Tracking**: Live WPM, accuracy, and completion monitoring
7. **🏆 Results & Leaderboard**: Final statistics and ranking display

---

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Lazy Loading**: Route-based code splitting
- **OnPush Strategy**: Optimized change detection
- **Signal-Based State**: Reactive state management
- **Bundle Optimization**: Tree-shaking and minification

### Backend Optimizations
- **Redis Caching**: Fast session and game state retrieval
- **Connection Pooling**: Efficient database connections
- **WebSocket Clustering**: Scalable real-time connections
- **Query Optimization**: Efficient database queries

---

## 📊 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination
- `POST /auth/refresh` - Token refresh
- `GET /users/profile` - User profile retrieval

### Game Endpoints
- `GET /paragraphs/random` - Random typing content
- `WebSocket Events` - Real-time game communication

---

## 🌟 Future Enhancements

- 🏆 **Tournament Mode**: Organized competitions with brackets
- 📈 **Advanced Analytics**: Detailed performance insights
- 🎨 **Theme Customization**: Personalized UI themes
- 🌍 **Internationalization**: Multi-language support
- 📱 **Mobile App**: Native mobile applications
- 🤖 **AI Training**: Intelligent difficulty adjustment

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


---

<div align="center">

**🎯 Ready to test your typing speed? [Start Playing Now!](#quick-start)**

</div>