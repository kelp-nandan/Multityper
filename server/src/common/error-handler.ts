import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorHandler {
    private static readonly errorMap = new Map([
        ['invalid credentials', { status: HttpStatus.UNAUTHORIZED, message: 'Invalid email or password' }],
        ['Invalid credentials', { status: HttpStatus.UNAUTHORIZED, message: 'Invalid email or password' }],
        ['email already exists', { status: HttpStatus.CONFLICT, message: 'Email already exists' }],
        ['duplicate email', { status: HttpStatus.CONFLICT, message: 'Email already exists' }],
        ['validation', { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Invalid input data' }],
        ['invalid format', { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Invalid input format' }],
        ['token expired', { status: HttpStatus.UNAUTHORIZED, message: 'Token expired' }],
        ['invalid token', { status: HttpStatus.UNAUTHORIZED, message: 'Invalid token' }],
    ]); static handleError(error: any, defaultMessage: string = 'Operation failed'): never {
        // Check if it's already an HttpException
        if (error instanceof HttpException) {
            throw error;
        }

        // Find matching error pattern
        for (const [pattern, config] of this.errorMap) {
            if (error.message?.toLowerCase().includes(pattern.toLowerCase())) {
                throw new HttpException(config.message, config.status);
            }
        }

        // Default fallback
        throw new HttpException(defaultMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}