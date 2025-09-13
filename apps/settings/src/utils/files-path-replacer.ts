import { FileType } from '../../../libs/common/enums/file-type.enum';

type Data = {
    [key: string]: string | undefined;
};

const fileTypePaths: Record<FileType, string> = {
    [FileType.HOST_INVOICE_PAYMENT]: 'private/unprocessed/hosts/{{hostId}}/invoices/{{invoiceId}}/{{filename}}',
    [FileType.HOST_PUBLIC_LOGO]: 'public/hosts/{{hostId}}/{{filename}}',
    [FileType.HOST_PRODUCT_MEDIA]: 'public/hosts/{{hostId}}/products/media/{{filename}}',
    [FileType.HOST_PRODUCT_TESTIMONIALS]: 'public/hosts/{{hostId}}/products/media/testimonials/{{filename}}',
    [FileType.HOST_PRODUCT_CONTENTS]: 'private/hosts/{{hostId}}/products/contents/{{filename}}',
    [FileType.HOST_PRODUCT_CONTENTS_THUMBNAILS]: 'public/hosts/{{hostId}}/products/thumbnails/{{filename}}',
};

export function filesPathReplacer(fileType: FileType, data: Data): string {
    const template = fileTypePaths[fileType];
    if (!template) {
        throw new Error(`No path template defined for file type: ${fileType}`);
    }
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] ?? `{{${key}}}`);
}
