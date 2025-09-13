import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const VERSION = process.env.VERSION as string;
const STAGE = process.env.STAGE || ('dev' as string);

export function setSwaggerConfig(app: INestApplication<any>, ms: string) {
    const prefix = STAGE != 'prod' ? `api-${STAGE}` : 'api';
    const server = `https://${prefix}.guaybo.app`;

    const options = new DocumentBuilder()
        .setTitle(`Guaybo Microservices - ${ms} MS`)
        .setDescription(`API specification for ${ms} Microservice`)
        .setVersion(VERSION)
        .addTag(`${ms} Microservice`)
        .addServer(server)
        .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'token-id')
        .build();

    return SwaggerModule.createDocument(app, options);
}
