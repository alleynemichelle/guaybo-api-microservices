export interface YouTubeVideoContentDetails {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: Record<string, any>;
    projection: string;
}

export interface YouTubeVideoItem {
    kind: string;
    etag: string;
    id: string;
    contentDetails: YouTubeVideoContentDetails;
}

export interface YouTubeVideoResponse {
    id: string;
    duration: number; // in minutes
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
}

export interface IYouTubeRepository {
    /**
     * Get video information from YouTube API
     * @param videoId YouTube video ID
     * @returns Video information with duration in minutes
     */
    getVideo(videoId: string): Promise<YouTubeVideoResponse | null>;

    /**
     * Extract video ID from YouTube URL
     * @param url YouTube URL in any format
     * @returns Video ID or null if invalid URL
     */
    extractVideoId(url: string): string | null;
}
