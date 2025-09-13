import { Module, Global, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './drizzle/config/database.config';
import { ConnectionFactory } from './drizzle/connection/connection.factory';
import { DatabaseService } from './drizzle/services/database.service';

/**
 * Global database module for PostgreSQL connections
 * Provides database configuration and connection management
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        DatabaseConfig,
        ConnectionFactory,
        DatabaseService,
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: (connectionFactory: ConnectionFactory) => {
                return connectionFactory.getSupabaseConnection();
            },
            inject: [ConnectionFactory],
        },
    ],
    exports: [DatabaseConfig, ConnectionFactory, DatabaseService, 'DATABASE_CONNECTION'],
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(private readonly connectionFactory: ConnectionFactory) {}

    /**
     * Clean up connections when application shuts down
     */
    async onApplicationShutdown(signal?: string): Promise<void> {
        console.log(`Application shutdown signal received: ${signal}`);
        await this.connectionFactory.closeAllConnections();
    }
}
