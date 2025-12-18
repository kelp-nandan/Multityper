# Backend Documentation

## Overview
This is a comprehensive login system backend built with NestJS, featuring user registration, authentication, and JWT-based authorization with PostgreSQL database integration.

## Technologies Used

### Core Technologies
- **NestJS** - Node.js framework for building scalable server-side applications
- **TypeScript** - Strongly typed JavaScript superset
- **PostgreSQL** - Relational database for data persistence
- **TypeORM** - Object-Relational Mapping for TypeScript/JavaScript

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication mechanism
- **bcrypt** - Password hashing library (12 salt rounds)
- **Passport.js** - Authentication middleware
- **@nestjs/passport** - Passport integration for NestJS

### Validation & Configuration
- **class-validator** - Input validation using decorators
- **class-transformer** - Object transformation
- **@nestjs/config** - Environment configuration management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Project Structure

```
server/
├── src/
│   ├── app.controller.ts          # Main application controller
│   ├── app.module.ts              # Root application module
│   ├── app.service.ts             # Main application service
│   ├── main.ts                    # Application entry point
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts         # Auth module configuration
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  # JWT authentication guard
│   │   └── strategies/
│   │       └── jwt.strategy.ts    # JWT validation strategy
│   └── user/                      # User management module
│       ├── user.controller.ts     # User API endpoints
│       ├── user.module.ts         # User module configuration
│       ├── user.service.ts        # User business logic
│       ├── dto/                   # Data Transfer Objects
│       │   ├── create-user.dto.ts # User registration validation
│       │   └── login-user.dto.ts  # User login validation
│       └── entities/
│           └── user.entity.ts     # User database entity
```

## Database Configuration

### Connection Details
- **Database**: PostgreSQL
- **URL**: `postgresql://admin:admin123@localhost:5432/testdb`
- **Host**: localhost
- **Port**: 5432
- **Database Name**: testdb
- **Username**: admin
- **Password**: admin123

### User Entity Schema
```typescript
Entity: users
├── id (Primary Key, Auto-generated)
├── name (String, max 100 characters)
├── email (String, Unique)
├── number (String, max 20 characters)
├── password (String, Hashed)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

## API Endpoints

### Base URL: `http://localhost:3000`

### 1. User Registration
- **Endpoint**: `POST /api/users/register`
- **Description**: Register a new user
- **Authentication**: Not required
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "user registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "number": "1234567890",
    "createdAt": "2025-12-15T06:47:49.200Z",
    "updatedAt": "2025-12-15T06:47:49.200Z"
  }
}
```

### 2. User Login
- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticate user and receive JWT token
- **Authentication**: Not required
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "user logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "number": "1234567890",
      "createdAt": "2025-12-15T06:47:49.200Z",
      "updatedAt": "2025-12-15T06:47:49.200Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get All Users
- **Endpoint**: `GET /api/users`
- **Description**: Retrieve all registered users
- **Authentication**: Required (JWT Token)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**:
```json
{
  "success": true,
  "message": "users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "number": "1234567890",
      "createdAt": "2025-12-15T06:47:49.200Z",
      "updatedAt": "2025-12-15T06:47:49.200Z"
    }
  ]
}
```

### 4. Get User Profile
- **Endpoint**: `GET /api/users/profile`
- **Description**: Get current authenticated user's profile
- **Authentication**: Required (JWT Token)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**:
```json
{
  "success": true,
  "message": "profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## Validation Rules

### User Registration Validation
- **Name**: 
  - Required
  - Minimum 2 characters
  - String type
- **Email**: 
  - Required
  - Valid email format
  - Unique in database
- **Number**: 
  - Required
  - Must be 10 digits
  - Numeric string
- **Password**: 
  - Required
  - Minimum 6 characters
  - Must contain at least one lowercase letter
  - Must contain at least one uppercase letter
  - Must contain at least one number

### User Login Validation
- **Email**: 
  - Required
  - Valid email format
- **Password**: 
  - Required
  - String type

## Security Features

### Password Security
- Passwords are hashed using **bcrypt** with 12 salt rounds
- Original passwords are never stored in the database
- Password comparison is done using bcrypt.compare()

### JWT Authentication
- **Secret Key**: `your-secret-key` (configurable via environment variables)
- **Token Expiry**: 24 hours
- **Algorithm**: HS256
- **Payload includes**: user ID, email, and name

### Route Protection
- Protected routes use `@UseGuards(JwtAuthGuard)`
- JWT tokens must be provided in Authorization header
- Format: `Authorization: Bearer <token>`

## Environment Configuration

### Required Environment Variables
```env
DATABASE_URL=postgresql://admin:admin123@localhost:5432/testdb
JWT_SECRET=your-secret-key
PORT=3000
```

### CORS Configuration
- Enabled for Angular frontend
- Origin: `http://localhost:4200`
- Credentials: Enabled

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation Steps
1. **Clone the repository and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Create database: `testdb`
   - Create user: `admin` with password `admin123`
   - Grant all privileges to user

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Server will be running on**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start server in debug mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development Features

### Auto-reload
- Development server automatically restarts on file changes
- Uses `--watch` flag for hot reloading

### Database Synchronization
- `synchronize: true` automatically creates/updates database tables
- Set to `false` in production and use migrations

### Logging
- Database queries are logged in development
- Console logs server startup confirmation

## Testing the API

### Using Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create new request
3. Set method and URL
4. Add request body for POST requests
5. Add Authorization header for protected routes

### Using cURL
```bash
# Register user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","number":"1234567890","password":"Password123"}'

# Login user
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Password123"}'

# Get users (with token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created (Registration)
- **401**: Unauthorized (Invalid credentials or missing token)
- **409**: Conflict (Email already exists)
- **400**: Bad Request (Validation errors)

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Future Enhancements

### Possible Additions
1. **Email Verification** - Send verification emails for new registrations
2. **Password Reset** - Forgot password functionality
3. **Role-Based Access Control** - Admin/User roles
4. **Rate Limiting** - Prevent brute force attacks
5. **Refresh Tokens** - For better security
6. **API Documentation** - Swagger/OpenAPI integration
7. **Logging** - Winston or similar logging library
8. **Environment Variables** - Better configuration management
9. **Database Migrations** - Proper database version control
10. **Unit & Integration Tests** - Comprehensive test coverage

---

**Created**: December 15, 2025  
**Version**: 1.0.0  
**Author**: Development Team