import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DatabaseConfig } from '../config/database.config';
import { SupabaseConnection } from './supabase.connection';
import * as schema from '../schemas';

/**
 * Factory for creating and managing database connections
 * Implements Factory pattern for different connection types
 */
@Injectable()
export class ConnectionFactory {
    private supabaseConnection: SupabaseConnection | null = null;

    constructor(private readonly databaseConfig: DatabaseConfig) {}

    /**
     * Gets Supabase connection instance
     */
    public getSupabaseConnection(): PostgresJsDatabase<typeof schema> {
        if (!this.supabaseConnection) {
            this.supabaseConnection = SupabaseConnection.getInstance(this.databaseConfig);
        }
        return this.supabaseConnection.getDatabase();
    }

    /**
     * Performs health check on all connections
     */
    public async healthCheck(): Promise<{
        supabase: boolean;
        overall: boolean;
    }> {
        const results = {
            supabase: false,
            overall: false,
        };

        try {
            if (this.supabaseConnection) {
                results.supabase = await this.supabaseConnection.healthCheck();
            }

            results.overall = results.supabase;
        } catch (error) {
            console.error('Connection factory health check failed:', error);
        }

        return results;
    }

    /**
     * Gets statistics from all connections
     */
    public getConnectionStats() {
        return {
            supabase: this.supabaseConnection?.getConnectionStats() || null,
        };
    }

    /**
     * Closes all connections
     * Should be called during application shutdown
     */
    public async closeAllConnections(): Promise<void> {
        const promises: Promise<void>[] = [];

        if (this.supabaseConnection) {
            promises.push(this.supabaseConnection.closeConnection());
        }

        await Promise.all(promises);
        console.log('All database connections closed');
    }
}
