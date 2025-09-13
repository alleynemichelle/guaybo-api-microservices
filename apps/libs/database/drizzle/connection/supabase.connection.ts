import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DatabaseConfig } from '../config/database.config';
import { ConnectionPoolConfig } from '../config/connection-pool.config';
import * as schema from '../schemas';

/**
 * Supabase connection service optimized for AWS Lambda
 * Uses postgres-js for better performance in serverless environments
 */
export class SupabaseConnection {
    private static instance: SupabaseConnection;
    private database: PostgresJsDatabase<typeof schema> | null = null;
    private client: postgres.Sql | null = null;
    private readonly databaseConfig: DatabaseConfig;
    private readonly poolConfig: ConnectionPoolConfig;

    private constructor(databaseConfig: DatabaseConfig) {
        this.databaseConfig = databaseConfig;
        this.poolConfig = ConnectionPoolConfig.getInstance(databaseConfig);
    }

    /**
     * Gets singleton instance
     */
    public static getInstance(databaseConfig: DatabaseConfig): SupabaseConnection {
        if (!SupabaseConnection.instance) {
            SupabaseConnection.instance = new SupabaseConnection(databaseConfig);
        }
        return SupabaseConnection.instance;
    }

    /**
     * Gets or creates the database connection
     */
    public getDatabase(): PostgresJsDatabase<typeof schema> {
        if (!this.database) {
            this.database = this.createConnection();
        }
        return this.database;
    }

    /**
     * Creates a new database connection optimized for Lambda
     */
    private createConnection(): PostgresJsDatabase<typeof schema> {
        const connectionString = this.poolConfig.getConnectionString();
        const postgresConfig = this.poolConfig.getPostgresConfig();

        // Create postgres-js client with optimized configuration
        this.client = postgres(connectionString, postgresConfig);

        // Create Drizzle instance with schema
        return drizzle(this.client, {
            schema,
            logger: !this.databaseConfig.isProduction(), // Enable logging in development
        });
    }

    /**
     * Closes the database connection
     * Should be called during Lambda shutdown
     */
    public async closeConnection(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
            this.database = null;
            console.log('Database connection closed');
        }
    }

    /**
     * Health check for the database connection
     */
    public async healthCheck(): Promise<boolean> {
        try {
            if (!this.database) {
                return false;
            }

            // Simple query to test connection
            await this.database.execute('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }

    /**
     * Gets connection statistics
     */
    public getConnectionStats() {
        if (!this.client) {
            return null;
        }

        return {
            // postgres-js doesn't expose detailed stats like pg Pool
            // but we can track basic connection state
            isConnected: this.client !== null,
            hasDatabase: this.database !== null,
        };
    }
}
