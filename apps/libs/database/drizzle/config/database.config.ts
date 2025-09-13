import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Database configuration service for PostgreSQL connections
 * Optimized for AWS Lambda cold starts and Supabase Supavisor
 */
@Injectable()
export class DatabaseConfig {
    constructor(private readonly configService: ConfigService) {}

    /**
     * Gets the database connection URL
     */
    getDatabaseUrl(): string {
        const url = this.configService.get<string>('DATABASE_URL');
        if (!url) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        return url;
    }

    /**
     * Gets connection pool configuration optimized for Lambda
     */
    getPoolConfig() {
        return {
            max: this.configService.get<number>('DB_POOL_MAX', 3), // Small pool for Lambda
            min: this.configService.get<number>('DB_POOL_MIN', 0),
            idleTimeoutMillis: this.configService.get<number>('DB_POOL_IDLE_TIMEOUT', 30000),
            connectionTimeoutMillis: this.configService.get<number>('DB_POOL_CONNECTION_TIMEOUT', 10000),
            acquireTimeoutMillis: this.configService.get<number>('DB_POOL_ACQUIRE_TIMEOUT', 30000),
        };
    }

    /**
     * Gets the current environment
     */
    getEnvironment(): string {
        return this.configService.get<string>('STAGE', 'dev');
    }

    /**
     * Checks if we're in production
     */
    isProduction(): boolean {
        return this.getEnvironment() === 'prod';
    }

    /**
     * Gets database connection options for Drizzle
     */
    getDrizzleConfig() {
        return {
            connectionString: this.getDatabaseUrl(),
            ssl: this.isProduction() ? { rejectUnauthorized: false } : false,
            pool: this.getPoolConfig(),
        };
    }
}
