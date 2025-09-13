import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schemas';

export type TransactionalExecutor = PostgresJsDatabase<typeof schema>;

/**
 * Database service that provides access to Drizzle ORM instance
 * This service acts as a bridge between NestJS and Drizzle ORM
 */
@Injectable()
export class DatabaseService {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private readonly database: PostgresJsDatabase<typeof schema>,
    ) {}

    /**
     * Gets the Drizzle database instance
     * Use this to access all database operations
     */
    getDatabase(): PostgresJsDatabase<typeof schema> {
        console.log('Database service getDatabase');
        return this.database;
    }

    /**
     * Health check method to verify database connectivity
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.database.execute('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}
