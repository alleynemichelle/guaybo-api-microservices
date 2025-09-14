import { Module } from '@nestjs/common';
import { TelegramRepository } from './telegram.repository';

@Module({
    providers: [TelegramRepository],
    exports: [TelegramRepository],
})
export class TelegramModule {}
