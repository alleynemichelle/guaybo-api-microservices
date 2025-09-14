import { IYouTubeRepository } from 'apps/libs/integrations/youtube/youtube.interface';

export async function getYouTubeDuration(url: string, youtubeRepository: IYouTubeRepository): Promise<number | null> {
    try {
        // Extract video ID from YouTube URL
        const videoId = youtubeRepository.extractVideoId(url);

        if (!videoId) {
            console.warn(`Could not extract video ID from YouTube URL: ${url}`);
            return null;
        }

        // Get video information from YouTube API
        const youtubeVideo = await youtubeRepository.getVideo(videoId);

        if (youtubeVideo?.duration) {
            console.log(`YouTube video duration obtained: ${youtubeVideo.duration} minutes`);
            return youtubeVideo.duration;
        }

        return null;
    } catch (error) {
        console.error('Error getting YouTube video duration:', error);
        return null;
    }
}
