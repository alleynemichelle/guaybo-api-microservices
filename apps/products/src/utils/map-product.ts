import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Multimedia } from 'apps/libs/entities/common/multimedia.entity';
import { setProduct } from 'apps/libs/entities/products/product-factory';
import { BaseProduct } from 'apps/libs/entities/products/product.entity';

export function mapProduct(product: BaseProduct, cfDomain?: string): BaseProduct {
    return setProduct({
        ...product,
        totalBookings: product.totalBookings ?? 0,
        ...(product.banner && { banner: addDomain(product.banner, cfDomain) }),
        ...(product.mainGallery && {
            mainGallery: product.mainGallery.map((resource) => addDomain(resource, cfDomain)),
        }),
        ...(product.gallery && { gallery: product.gallery.map((resource) => addDomain(resource)) }),
        ...(product.testimonials && {
            testimonials: product.testimonials.map((testimonial) => ({
                ...testimonial,
                ...(testimonial.images && {
                    images: testimonial.images.map((resource) => addDomain(resource, cfDomain)),
                }),
            })),
        }),
    });
}

export const addDomain = (multimedia: Multimedia, cfDomain?: string): Multimedia => {
    return {
        ...multimedia,
        path: multimedia.source == MultimediaSource.APP ? `https://${cfDomain}/${multimedia.path}` : multimedia.path,
    };
};
