import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SEBulkResult } from './se-bulk-result.entity';
import { SEResult } from './se-search-result.entity';

@Injectable()
export class OpenSearchService {
    private endpoint: string;
    private axiosInstance: AxiosInstance;

    constructor(private configService: ConfigService) {
        this.endpoint = this.configService.get('OPEN_SEARCH_ENDPOINT') as string;
        const username = this.configService.get('OPEN_SEARCH_USERNAME');
        const password = this.configService.get('OPEN_SEARCH_PASSWORD');

        const auth = {
            username,
            password,
        };

        this.axiosInstance = axios.create({
            baseURL: this.endpoint,
            auth,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async search(index: string, query: Record<string, any>): Promise<SEResult> {
        try {
            const response = await this.axiosInstance.post(`/${index}/_search`, query);
            const searchResult = response.data;

            const result: SEResult = {
                time: searchResult.took,
                timedOut: searchResult.timed_out,
                hits: searchResult.hits.hits.map((hit) => ({ ...hit['_source'], score: hit['_score'] })),
                total: searchResult.hits?.total?.value,
                aggregations: searchResult.aggregations,
            };

            return result;
        } catch (error) {
            console.log('Error in searching opensearch ', error);
            throw error;
        }
    }

    async indexDocument(documents: Record<string, any>[], index: string): Promise<SEBulkResult> {
        try {
            const bulkBody: string[] = [];

            for (const doc of documents) {
                bulkBody.push(JSON.stringify({ create: { _index: index, _id: doc.recordId } }));
                bulkBody.push(JSON.stringify({ ...doc, createdAt: new Date().toISOString() }));
            }

            const bulkPayload = bulkBody.join('\n') + '\n';
            const response = await this.axiosInstance.post('/_bulk', bulkPayload, {
                headers: {
                    'Content-Type': 'application/x-ndjson',
                },
            });

            const results = response.data;

            return {
                time: results.took,
                failed: results.errors ? 1 : 0,
                successful: results.items.filter((item) => !item.create.error).length,
                aborted: false,
                bytes: bulkPayload.length,
                retry: 0,
                total: documents.length,
            };
        } catch (error) {
            console.log('Error indexing document ', error);
            throw error;
        }
    }

    async updateDocument(index: string, documentId: string, data: Record<string, any>): Promise<void> {
        try {
            await this.axiosInstance.post(`/${index}/_update/${documentId}`, {
                doc: {
                    ...data,
                },
            });
        } catch (error) {
            console.log('Error updating document ', documentId, error);
            throw error;
        }
    }

    async getDocument(index: string, documentId: string): Promise<any> {
        try {
            const response = await this.axiosInstance.get(`/${index}/_doc/${documentId}`);
            const searchResult = response.data;

            const result = {
                ...searchResult['_source'],
            };

            return result;
        } catch (error) {
            console.log('Error in searching opensearch ', error);
            throw error;
        }
    }
}
