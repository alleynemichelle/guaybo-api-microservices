import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { ResourceProcessingStatus } from 'apps/libs/common/enums/resource-processing-status.enum';
import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import { ProductResourceFileType } from 'apps/libs/common/enums/product-resource-file-type.enum';

import { ProductResourceWithRelations } from '../types';

export class ProductResourceMapper {
    static toDomain(row: ProductResourceWithRelations): ProductResource {
        const productResource = new ProductResource({
            id: row.id,
            recordId: row.recordId,
            parentId: row.parent?.recordId ?? undefined,
            parent: row.parent
                ? {
                      id: row.parent.id,
                      recordId: row.parent.recordId,
                  }
                : undefined,
            type: row.type as ProductResourceType,
            title: row.title,
            description: row.description ?? undefined,
            longDescription: row.longDescription ?? undefined,
            fileType: (row.multimedia?.type as ProductResourceFileType) ?? undefined,
            source: (row.multimedia?.source as MultimediaSource) ?? MultimediaSource.APP,
            fileName: row.multimedia?.filename ?? undefined,
            url: row.multimedia?.path ?? undefined,
            fileId: row.fileId ?? undefined,
            processingStatus: (row.processingStatus?.name as ResourceProcessingStatus) ?? undefined,
            encodeProgress: row.encodeProgress ?? undefined,
            size: row.size ? parseFloat(row.size) : undefined,
            duration: row.duration ? parseFloat(row.duration) : undefined,
            preview: row.preview ?? undefined,
            order: row.orderIndex,
            downloadable: row.downloadable ?? undefined,
            //planIds: row.planIds ?? undefined,
            totalViews: row.totalViews ?? undefined,
            recordStatus: (row.status?.name as Status) ?? Status.ACTIVE,
            recordType: DatabaseKeys.PRODUCT_RESOURCE,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
        });

        // Map thumbnail if available
        if (row.thumbnail) {
            productResource.thumbnail = {
                type: row.thumbnail.type as MultimediaType,
                source: row.thumbnail.source as MultimediaSource,
                path: row.thumbnail.path ?? undefined,
            };
            productResource.thumbnailId = row.thumbnail.id;
        }

        // Map multimedia if available
        if (row.multimedia) {
            productResource.url = row.multimedia.path ?? undefined;
            productResource.fileName = row.multimedia.filename ?? undefined;
            productResource.size = row.multimedia.size ? parseFloat(row.multimedia.size) : undefined;
            productResource.duration = row.multimedia.duration ? parseFloat(row.multimedia.duration) : undefined;
            productResource.multimediaId = row.multimedia.id;
        }

        return productResource;
    }
}
