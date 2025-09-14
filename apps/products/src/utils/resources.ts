import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { ProductResourceResponse } from '../dto/responses/get-product-resources.response';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';

/**
 * Calculate the total duration from all resources
 */
export function calculateTotalDuration(resources: ProductResource[]): number {
    return Math.round(
        resources.reduce((total, resource) => {
            return total + (resource.duration || 0);
        }, 0),
    );
}

/**
 * Count resources by their type
 */
export function countResourcesByType(resources: ProductResource[], type: ProductResourceType): number {
    return resources.filter((resource) => resource.type === type).length;
}

export async function buildHierarchicalResourceResponse(
    cfDomain: string,
    parentResources: ProductResource[],
    allResources: ProductResource[],
    options: {
        isPublic: boolean;
        completedResourcesMap?: Map<string, boolean>;
    },
): Promise<ProductResourceResponse[]> {
    return Promise.all(
        parentResources
            .sort((a, b) => a.order - b.order)
            .map(async (parent) => {
                const children = allResources.filter((c) => c.parent?.recordId === parent.recordId);

                // Create the base response object
                const resourceResponse: ProductResourceResponse = {
                    recordId: parent.recordId!,
                    type: parent.type,
                    title: parent.title,
                    order: parent.order,
                };

                // Add optional attributes if they exist

                if (parent.preview !== undefined) resourceResponse.preview = parent.preview;
                if (parent.fileName) resourceResponse.fileName = parent.fileName;
                if (parent.size) resourceResponse.size = parent.size;
                if (parent.duration) resourceResponse.duration = parent.duration;
                if (parent.source) resourceResponse.source = parent.source;
                if (parent.processingStatus) resourceResponse.processingStatus = parent.processingStatus;
                if (parent.description) resourceResponse.description = parent.description;
                if (parent.fileType) resourceResponse.fileType = parent.fileType;
                if (!options.isPublic && parent.fileId) resourceResponse.fileId = parent.fileId;
                if (!options.isPublic && parent.encodeProgress) resourceResponse.encodeProgress = parent.encodeProgress;

                if (!options.isPublic && parent.url) resourceResponse.url = parent.url;
                if (!options.isPublic && parent.longDescription)
                    resourceResponse.longDescription = parent.longDescription;

                if (!options.isPublic && options.completedResourcesMap)
                    resourceResponse.completed = options.completedResourcesMap.get(parent.recordId!) || false;

                resourceResponse.downloadable = parent.downloadable || false;

                if (parent.thumbnail?.path) {
                    resourceResponse.thumbnail = {
                        ...parent.thumbnail,
                        path:
                            parent.thumbnail.source === MultimediaSource.APP
                                ? `https://${cfDomain}/${parent.thumbnail.path}`
                                : parent.thumbnail.path,
                    };
                }

                // Add children recursively if they exist
                if (children.length > 0) {
                    resourceResponse.children = await buildHierarchicalResourceResponse(
                        cfDomain,
                        children,
                        allResources,
                        options,
                    );
                }

                return resourceResponse;
            }),
    );
}
