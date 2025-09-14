import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YouTubeVideoResponse, YouTubeVideoItem } from './youtube.interface';

@Injectable()
export class YouTubeService {
    private readonly logger = new Logger(YouTubeService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
    }

    /**
     * Extract video ID from YouTube URL
     * Supports multiple URL formats:
     * - https://www.youtube.com/watch?v=VIDEO_ID
     * - https://youtube.com/watch?v=VIDEO_ID
     * - https://youtu.be/VIDEO_ID
     * - https://www.youtube.com/embed/VIDEO_ID
     * - https://www.youtube.com/v/VIDEO_ID
     * - https://www.youtube.com/watch?v=VIDEO_ID&feature=youtu.be
     * - https://www.youtube.com/watch?v=VIDEO_ID&t=123s
     * - https://m.youtube.com/watch?v=VIDEO_ID
     * - https://youtube.com/shorts/VIDEO_ID
     */
    extractVideoId(url: string): string | null {
        if (!url || typeof url !== 'string') {
            return null;
        }

        try {
            // Remove whitespace and convert to lowercase for consistent matching
            const cleanUrl = url.trim();

            // Pattern for different YouTube URL formats
            const patterns = [
                // Standard watch URLs with query parameters
                /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
                // youtu.be short URLs
                /youtu\.be\/([a-zA-Z0-9_-]{11})/,
                // Embed URLs
                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                // Old style video URLs
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
                // YouTube shorts
                /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
                // Mobile URLs
                /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
                // Gaming URLs
                /gaming\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            ];

            for (const pattern of patterns) {
                const match = cleanUrl.match(pattern);
                if (match && match[1]) {
                    const videoId = match[1];
                    // Validate video ID length (YouTube video IDs are always 11 characters)
                    if (videoId.length === 11) {
                        this.logger.debug(`Extracted video ID: ${videoId} from URL: ${url}`);
                        return videoId;
                    }
                }
            }

            // If it's already a video ID (11 characters, alphanumeric + dash + underscore)
            if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
                this.logger.debug(`Input is already a video ID: ${cleanUrl}`);
                return cleanUrl;
            }

            this.logger.warn(`Could not extract video ID from URL: ${url}`);
            return null;
        } catch (error) {
            this.logger.error(`Error extracting video ID from URL: ${url}`, error);
            return null;
        }
    }

    /**
     * Get video information from YouTube API
     */
    async getVideo(videoId: string): Promise<YouTubeVideoResponse | null> {
        try {
            if (!this.apiKey) {
                this.logger.error('YouTube API key not configured');
                return null;
            }

            const url = `${this.baseUrl}/videos?id=${videoId}&part=contentDetails&key=${this.apiKey}`;

            const response = await fetch(url);

            if (!response.ok) {
                this.logger.error(`YouTube API error: ${response.status} - ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                this.logger.warn(`Video not found: ${videoId}`);
                return null;
            }

            const videoItem: YouTubeVideoItem = data.items[0];
            const durationInMinutes = this.convertDurationToMinutes(videoItem.contentDetails.duration);

            return {
                id: videoItem.id,
                duration: durationInMinutes,
                dimension: videoItem.contentDetails.dimension,
                definition: videoItem.contentDetails.definition,
                caption: videoItem.contentDetails.caption,
                licensedContent: videoItem.contentDetails.licensedContent,
                projection: videoItem.contentDetails.projection,
            };
        } catch (error) {
            this.logger.error(`Error fetching video ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Convert ISO 8601 duration format (PT46M4S) to minutes
     * @param isoDuration Duration in ISO 8601 format
     * @returns Duration in minutes (rounded to 2 decimal places)
     */
    private convertDurationToMinutes(isoDuration: string): number {
        // Parse ISO 8601 duration format (PT46M4S)
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

        if (!match) {
            this.logger.warn(`Invalid duration format: ${isoDuration}`);
            return 0;
        }

        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);

        const totalMinutes = hours * 60 + minutes + seconds / 60;

        return Math.round(totalMinutes * 100) / 100; // Round to 2 decimal places
    }
}
