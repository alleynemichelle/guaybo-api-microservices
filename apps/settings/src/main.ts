import { ReplaySubject, firstValueFrom } from 'rxjs';
import { Callback, Context, APIGatewayEvent, Handler } from 'aws-lambda';
import helmet from 'helmet';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@codegenie/serverless-express';

import { setCorsConfig } from 'apps/libs/common/api/set-cors.function';
import { FRONTEND_DOMAINS } from 'apps/libs/common/constants/domains.constant';
import { bodyParserMiddleware } from 'apps/libs/common/api/body-parser.middleware';
import { setValidationError } from 'apps/libs/common/api/set-validation-error.function';
import { setSwaggerConfig } from 'apps/libs/common/api/set-swagger.function';
import { SettingsModule } from './settings.module';

let server: any;
const serverSubject = new ReplaySubject<Handler>();

async function bootstrap(): Promise<any> {
    const app = await NestFactory.create(SettingsModule);

    // Security headers with Helmet (environment-specific configuration)
    const isDev = process.env.STAGE === 'dev';
    app.use(
        helmet({
            contentSecurityPolicy: isDev
                ? {
                      directives: {
                          defaultSrc: ["'self'"],
                          styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline styles
                          scriptSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline scripts
                          imgSrc: ["'self'", 'data:', 'https:'],
                          connectSrc: ["'self'", 'https:'],
                          fontSrc: ["'self'", 'data:'], // Swagger UI fonts
                      },
                  }
                : {
                      directives: {
                          defaultSrc: ["'self'"],
                          styleSrc: ["'self'"], // No inline styles in production
                          scriptSrc: ["'self'"], // No inline scripts in production
                          imgSrc: ["'self'", 'data:', 'https:'],
                          connectSrc: ["'self'", 'https:'],
                      },
                  },

            hsts: { maxAge: 31536000, includeSubDomains: true },
            noSniff: true,
            frameguard: { action: 'sameorigin' },
            xssFilter: true,
        }),
    );

    app.use((req, res, next) => {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    // apply cors only for frontend domains
    const allowedOrigins = isDev ? ['*'] : FRONTEND_DOMAINS[process.env.STAGE as keyof typeof FRONTEND_DOMAINS];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });

    app.use(bodyParserMiddleware);
    setCorsConfig(app);
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (error) => {
                return new BadRequestException(setValidationError(error));
            },
            stopAtFirstError: true,
            whitelist: true,
        }),
    );
    if (process.env.STAGE === 'dev') {
        const swaggerDoc = setSwaggerConfig(app, 'Settings');
        SwaggerModule.setup('/api', app, swaggerDoc);
    }
    await app.init();
    await app.listen(3000);

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
}

bootstrap().then((server) => serverSubject.next(server));

export const handler: any = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    server = server ?? (await firstValueFrom(serverSubject));
    return server(event, context, callback);
};
