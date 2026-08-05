import type { FocalPoint, ImageParams, SectionMedia } from './types';

export type MediaEntity = {
    source_url?: string;
    media_details?: {
        sizes?: Record<string, { source_url?: string }>;
    };
};

export const DEFAULT_FOCAL_POINT: FocalPoint = { x: 0.5, y: 0.5 };
export const DEFAULT_ZOOM = 1;

export function createDefaultImageParams(id = 0): ImageParams {
    return {
        id,
        focalPoint: DEFAULT_FOCAL_POINT,
        zoom: DEFAULT_ZOOM,
    };
}

export function createDefaultCaption(): SectionMedia['caption'] {
    return {
        text: '',
        orientation: { x: 'left', y: 'top' },
    };
}

export function createDefaultMedia(): SectionMedia {
    return {
        type: 'img',
        origin: 'file',
        attachment: createDefaultImageParams(),
        poster: createDefaultImageParams(),
        embedUrl: '',
        caption: createDefaultCaption(),
        gallery: {
            images: [],
            sliderSettings: { slidesPerView: 1, autoplay: false },
        },
    };
}

export function getMediaUrl(media?: MediaEntity | null): string {
    return media?.media_details?.sizes?.large?.source_url
        || media?.media_details?.sizes?.medium_large?.source_url
        || media?.media_details?.sizes?.medium?.source_url
        || media?.media_details?.sizes?.full?.source_url
        || media?.source_url
        || '';
}
