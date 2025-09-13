import { DatabaseConfig } from './database.config';

/**
 * Connection configuration for postgres-js client
 * Optimized for AWS Lambda and Supabase Supavisor
 */
export class ConnectionPoolConfig {
    private static instance: ConnectionPoolConfig;
    private readonly databaseConfig: DatabaseConfig;

    private constructor(databaseConfig: DatabaseConfig) {
        this.databaseConfig = databaseConfig;
    }

    /**
     * Gets singleton instance
     */
    public static getInstance(databaseConfig: DatabaseConfig): ConnectionPoolConfig {
        if (!ConnectionPoolConfig.instance) {
            ConnectionPoolConfig.instance = new ConnectionPoolConfig(databaseConfig);
        }
        return ConnectionPoolConfig.instance;
    }

    /**
     * Gets postgres-js configuration optimized for Lambda
     */
    public getPostgresConfig() {
        const poolConfig = this.databaseConfig.getPoolConfig();

        return {
            // Connection pool settings optimized for Lambda
            max: poolConfig.max, // Small pool for Lambda
            idle_timeout: Math.floor(poolConfig.idleTimeoutMillis / 1000), // Convert to seconds
            connect_timeout: Math.floor(poolConfig.connectionTimeoutMillis / 1000),

            // Disable prepared statements for better cold start performance
            prepare: false,

            // SSL configuration for Supabase
            ssl: this.databaseConfig.isProduction() ? { rejectUnauthorized: false } : false,

            // Transform configuration
            transform: {
                undefined: null, // Transform undefined to null for PostgreSQL
            },

            // Additional Lambda optimizations
            max_lifetime: 60 * 60, // 1 hour max connection lifetime
            debug: !this.databaseConfig.isProduction(), // Debug in development only

            // Connection lifecycle hooks
            onnotice: (notice: any) => {
                if (!this.databaseConfig.isProduction()) {
                    console.log('PostgreSQL notice:', notice);
                }
            },

            onparameter: (key: string, value: any) => {
                if (!this.databaseConfig.isProduction()) {
                    console.log(`PostgreSQL parameter: ${key} = ${value}`);
                }
            },
        };
    }

    /**
     * Gets connection string for postgres-js
     */
    public getConnectionString(): string {
        return this.databaseConfig.getDatabaseUrl();
    }
}
