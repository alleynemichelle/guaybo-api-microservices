import { INestApplication } from '@nestjs/common';

/**
 * Sets up CORS configuration for a NestJS application.
 * This function centralizes the CORS logic for all microservices.
 *
 * @param app - The NestJS application instance
 */
export function setCorsConfig(app: INestApplication): void {
    // Get allowed origins from environment variables
    const allowedOrigins: string[] = [
        process.env.ADMIN_FRONTEND_APP_HOST || '',
        process.env.FRONTEND_APP_HOST || '',
        'https://www.guaybo.com',
        'https://www.admin.guaybo.com',
    ];
    // Add localhost for non-production environments
    if (process.env.STAGE !== 'prod') {
        allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    }

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Api-Key', 'X-Requested-With'],
        maxAge: 3600,
    });
}
