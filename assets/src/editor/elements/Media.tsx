import { wp } from '@/editor/wp';
import type { SectionMedia } from '../types';

const { createElement } = wp.element;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const { __ } = wp.i18n;

type MediaEntity = {
	source_url?: string;
	media_details?: {
		sizes?: Record<string, { source_url?: string }>;
	};
};

function getMediaUrl(media?: MediaEntity | null): string {
	return media?.media_details?.sizes?.large?.source_url
		|| media?.media_details?.sizes?.medium_large?.source_url
		|| media?.media_details?.sizes?.medium?.source_url
		|| media?.source_url
		|| '';
}

function getPreviewAttachmentId(media?: SectionMedia): number {
	if (!media) {
		return 0;
	}

	if (media.type === 'gallery') {
		return media.gallery?.images?.[0]?.id ?? 0;
	}

	if (media.type === 'video-embed' || media.type === 'video-modal') {
		return media.poster?.id || (media.origin === 'file' ? media.attachment?.id : 0);
	}

	return media.attachment?.id ?? 0;
}

export default function Media({ media }: { media?: SectionMedia }) {
	const previewAttachmentId = getPreviewAttachmentId(media);
	const previewMedia = useSelect((select) => {
		if (!previewAttachmentId) {
			return null;
		}

		return select(store).getMedia(previewAttachmentId) as MediaEntity | null;
	}, [previewAttachmentId]);
	const previewUrl = getMediaUrl(previewMedia);
	const isVideoFilePreview = media?.type !== 'img'
		&& media?.type !== 'gallery'
		&& media?.origin === 'file'
		&& Boolean(media?.attachment?.id)
		&& !media?.poster?.id;
	const galleryCount = media?.type === 'gallery' ? media.gallery?.images?.length ?? 0 : 0;
	const embedUrl = media?.type !== 'img' && media?.type !== 'gallery' && media?.origin === 'embed'
		? media.embedUrl
		: '';
	const imageParams = media?.type === 'video-embed' || media?.type === 'video-modal'
		? media.poster
		: media?.attachment;
	const focalPoint = imageParams?.focalPoint ?? { x: 0.5, y: 0.5 };
	const zoom = imageParams?.zoom ?? 1;

    return (
        <div className="grid gap-3 rounded-2xl border border-dashed border-[#D9DDE7] bg-neutral-50 p-4">
            {previewUrl ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {isVideoFilePreview ? (
                        <video src={previewUrl} controls className="block max-h-72 w-full bg-black object-contain" />
                    ) : (
                        <img
							src={previewUrl}
							alt=""
							className="block max-h-72 w-full object-cover transition-transform"
							style={{
								objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
								transform: `scale(${zoom})`,
								transformOrigin: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
							}}
						/>
                    )}
                </div>
            ) : embedUrl ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-4 type-small text-main">
                    {embedUrl}
                </div>
            ) : null}
            <div className="type-x-small text-neutral-secondary">
                {galleryCount
                    ? `${__('Gallery', 'frontenda-blocks')}: ${galleryCount}`
                    : __('Media is edited in the block sidebar.', 'frontenda-blocks')}
            </div>
        </div>
    );
}
