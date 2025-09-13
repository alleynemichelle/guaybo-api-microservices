import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { getHostFilters, staticValues } from '../constants/host-filters';
import { OpenSearchService } from 'apps/libs/integrations/opensearch/opensearch.service';

@Injectable()
export class GetFiltersHandler {
    private readonly stage = this.configService.get('STAGE') as string;
    private readonly project = this.configService.get('PROJECT') as string;

    constructor(
        private readonly openSearchService: OpenSearchService,
        private readonly configService: ConfigService,
    ) {}

    async execute(hostId: string): Promise<any> {
        const hostFilters = getHostFilters(this.stage, this.project);
        const aggregations = {};

        // building  query for each aggregation
        for (const filter of hostFilters) {
            const query = {
                size: 0,
                query: {
                    term: { [filter.filter.key]: hostId },
                },
                aggs: filter.fields.reduce((aggs, field) => {
                    const fieldName = field.name;
                    aggs[fieldName] = { terms: { field: field.key } };
                    return aggs;
                }, {}),
            };

            const result = await this.openSearchService.search(filter.name, query);

            // building response
            aggregations[filter.key] = Object.keys(result.aggregations || {}).reduce((obj, key) => {
                if (result.aggregations && result.aggregations[key]?.buckets) {
                    obj[key] = result.aggregations[key].buckets.map((bucket) => ({
                        value: bucket.key,
                        count: bucket.doc_count,
                    }));
                } else {
                    obj[key] = [];
                }
                return obj;
            }, {});

            aggregations[filter.key] = filter.fields.reduce((obj, field) => {
                if (staticValues[field.name]) {
                    const openSearchValues = result.aggregations?.[field.name]?.buckets || [];
                    obj[field.name] = staticValues[field.name].map((staticItem) => {
                        const match = openSearchValues.find((osItem) => osItem.key === staticItem.value);
                        return match ? { ...staticItem, count: match.doc_count } : staticItem;
                    });
                } else if (result.aggregations && result.aggregations[field.name]?.buckets) {
                    obj[field.name] = result.aggregations[field.name].buckets.map((bucket) => ({
                        value: bucket.key,
                        count: bucket.doc_count,
                    }));
                } else {
                    obj[field.name] = [];
                }
                return obj;
            }, {});
        }

        return { ...aggregations };
    }
}
