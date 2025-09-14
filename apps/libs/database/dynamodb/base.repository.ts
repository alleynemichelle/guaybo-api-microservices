import { Injectable } from '@nestjs/common';
import { DatabaseAdapter } from '../adapters/database.adapter';

@Injectable()
export class BaseRepository<T> {
    constructor(private readonly adapter: DatabaseAdapter) {}

    async get<T>(params: any): Promise<T> {
        return this.adapter.get<T>(params);
    }

    async put<T>(params: any): Promise<void> {
        return this.adapter.put<T>(params);
    }

    async delete(params: any): Promise<void> {
        return this.adapter.delete(params);
    }

    async query<T>(params: any): Promise<T[]> {
        return this.adapter.query<T>(params);
    }

    async scan<T>(params: any): Promise<T[]> {
        return this.adapter.scan<T>(params);
    }

    async batchWriteItems<T>(params: any): Promise<void> {
        return this.adapter.batchWriteItems(params);
    }

    async batchGetItems<T>(params: any): Promise<T[]> {
        return this.adapter.batchGetItems(params);
    }

    async batchUpdateItems<T>(params: any): Promise<T[]> {
        return this.adapter.batchUpdateItems(params);
    }
}
