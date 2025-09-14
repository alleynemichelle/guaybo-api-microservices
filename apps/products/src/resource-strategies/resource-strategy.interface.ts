import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ProductResource } from 'apps/libs/entities/products/product-resource.entity';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

/**
 * Interface for resource strategies
 */
export interface ResourceStrategy {
    /**
     * Deletes the resource according to its source
     * @param resource The resource to delete
     */
    deleteResource(data: { path?: string; url?: string; source?: MultimediaSource }): Promise<void>;

    /**
     * Gets the public URL for the resource according to its source
     * @param resource The resource to get the public URL
     * @param contentMode The content mode for the resource
     */
    getPublicUrl(
        data: { path?: string; url?: string; source: MultimediaSource },
        contentMode?: ContentMode,
    ): Promise<string>;
}
