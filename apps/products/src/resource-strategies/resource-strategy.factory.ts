import { Injectable } from '@nestjs/common';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ResourceStrategy } from './resource-strategy.interface';
import { AppResourceStrategy } from './app-resource-strategy';
import { BunnyStorageStrategy } from './bunny-storage-strategy';
import { BunnyStreamStrategy } from './bunny-stream-strategy';

/**
 * Factory to get the correct resource strategy by source
 */
@Injectable()
export class ResourceStrategyFactory {
    private readonly strategies: Map<MultimediaSource, ResourceStrategy>;

    constructor(
        private readonly appResourceStrategy: AppResourceStrategy,
        private readonly bunnyStorageStrategy: BunnyStorageStrategy,
        private readonly bunnyStreamStrategy: BunnyStreamStrategy,
    ) {
        this.strategies = new Map<MultimediaSource, ResourceStrategy>([
            [MultimediaSource.APP, this.appResourceStrategy],
            [MultimediaSource.BUNNY_STORAGE, this.bunnyStorageStrategy],
            [MultimediaSource.BUNNY_STREAM, this.bunnyStreamStrategy],
        ]);
    }

    /**
     * Gets the strategy for the given source
     * @param source The multimedia source
     */
    getStrategy(source: MultimediaSource): ResourceStrategy | undefined {
        return this.strategies.get(source);
    }
}
