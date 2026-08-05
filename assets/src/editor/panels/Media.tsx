import { wp } from '../wp';

const { __ } = wp.i18n;

import type {
    FocalPoint,
    MediaSelection,
    SectionMedia,
    GalleryImage,
} from '../types';
import ZoomableFocalPointPicker from '../components/ZoomableFocalPointPicker';
import {
    createDefaultCaption,
    createDefaultImageParams,
    createDefaultMedia,
    DEFAULT_FOCAL_POINT,
    DEFAULT_ZOOM,
    getMediaUrl,
    type MediaEntity,
} from '../media';

const { createElement } = wp.element;
const { MediaUpload, MediaUploadCheck } = wp.blockEditor;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const {
    BaseControl,
    Button,
    PanelBody,
    RangeControl,
    SelectControl,
    TextControl,
    TextareaControl
} = wp.components;

type MediaPanelProps = {
    attributes: {
        media?: SectionMedia;
    };
    setAttributes: (attributes: { media?: SectionMedia }) => void;
};

export default function Media({
    attributes,
    setAttributes,
}: MediaPanelProps) {

    const media = attributes.media ?? createDefaultMedia();
    const attachment = media?.attachment || createDefaultImageParams();
    const poster = media?.poster || createDefaultImageParams();
    const caption = media?.caption || createDefaultCaption();

    const attachmentMedia = useSelect((select) => {
        if (!attachment.id) {
            return null;
        }

        return select(store).getMedia(attachment.id) as MediaEntity | null;
    }, [attachment.id]);

    const posterMedia = useSelect((select) => {
        if (!poster.id) {
            return null;
        }

        return select(store).getMedia(poster.id) as MediaEntity | null;
    }, [poster.id]);

    const attachmentUrl = getMediaUrl(attachmentMedia);
    const posterUrl = getMediaUrl(posterMedia);

    const onSelectImage = (nextMedia: MediaSelection): void => {
        setAttributes({
            media: {
                ...media,
                type: 'img',
                origin: 'file',
                attachment: createDefaultImageParams(nextMedia.id),
            }
        });
    };

    const onSelectGallery = (nextMedia: MediaSelection | MediaSelection[]): void => {
        setAttributes({
            media: {
                ...media,
                type: 'gallery',
                gallery: {
                    ...media.gallery,
                    images: ((media: MediaSelection | MediaSelection[]): GalleryImage[] => {
                        const mediaItems = Array.isArray(media) ? media : [media];
                        return mediaItems
                            .filter((item): item is MediaSelection => Boolean(item && item.id))
                            .map((item) => ({
                                id: item.id,
                            }));
                    })(nextMedia),
                },
            }
        });
    };

    const onSelectVideoFile = (nextMedia: MediaSelection): void => {
        setAttributes({
            media: {
                ...media,
                origin: 'file',
                attachment: {
                    ...attachment,
                    id: nextMedia.id,
                },
            },
        });
    };

    const onSelectPoster = (nextMedia: MediaSelection): void => {
        setAttributes({
            media: {
                ...media,
                poster: createDefaultImageParams(nextMedia.id),
            }
        });
    };

    const onResetMedia = (): void => {
        setAttributes({
            media: undefined,
        });
    };

    return (
        <PanelBody title={__('Media', 'frontenda-blocks')} initialOpen={true}>
            <SelectControl
                label={__('Media Type', 'frontenda-blocks')}
                value={media.type}
                options={[
                    { label: __('Image', 'frontenda-blocks'), value: 'img' },
                    { label: __('Video Embed', 'frontenda-blocks'), value: 'video-embed' },
                    { label: __('Video Modal', 'frontenda-blocks'), value: 'video-modal' },
                    { label: __('Gallery', 'frontenda-blocks'), value: 'gallery' },
                ]}
                onChange={(value: SectionMedia['type']) => {
                    const newValue = value ? {
                        media: {
                            ...media,
                            type: value,
                        }
                    } : {
                        media: undefined,
                    };
                    setAttributes(newValue);
                }}
            />
            {(media.type === 'video-embed' || media.type === 'video-modal') ? (
                <SelectControl
                    label={__('Video Source', 'frontenda-blocks')}
                    value={media.origin}
                    options={[
                        { label: __('Uploaded File', 'frontenda-blocks'), value: 'file' },
                        { label: __('Embed URL', 'frontenda-blocks'), value: 'embed' },
                    ]}
                    onChange={(value: 'file' | 'embed') => {
                        setAttributes({ media: { ...media, origin: value } });
                    }}
                />
            ) : null}

            {media.type === 'img' ? (
                <BaseControl label={__('Image', 'frontenda-blocks')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectImage}
                            allowedTypes={['image']}
                            value={attachment.id}
                            render={({ open }: { open: () => void }) => (
                                <div className="flex items-center text-center gap-2">
                                    <Button variant="secondary" onClick={open}>
                                        {attachment.id ? __('Replace Image', 'frontenda-blocks') : __('Select Image', 'frontenda-blocks')}
                                    </Button>
                                    {attachment.id ? (
                                        <Button
                                            variant="link"
                                            isDestructive
                                            onClick={onResetMedia}
                                            style={{ marginLeft: '12px' }}
                                        >
                                            {__('Remove Image', 'frontenda-blocks')}
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                </BaseControl>
            ) : null}

            {media.type === 'img' && attachment.id && attachmentUrl ? (
                <BaseControl
                    label={__('Attachment Focal Point', 'frontenda-blocks')}
                    help={__('Choose the visible focus area for the selected image.', 'frontenda-blocks')}
                >
                    <div style={{ overflow: 'hidden' }}>
                        <ZoomableFocalPointPicker
                            url={attachmentUrl}
                            focalPoint={attachment.focalPoint || DEFAULT_FOCAL_POINT}
                            zoom={attachment.zoom || DEFAULT_ZOOM}
                            onChange={(value: FocalPoint) => {
                                setAttributes({
                                    media: {
                                        ...media,
                                        attachment: {
                                            ...attachment,
                                            focalPoint: value,
                                        },
                                    }
                                });
                            }}
                        />
                    </div>
                </BaseControl>
            ) : null}

            {media.type === 'img' && attachment.id ? (
                <RangeControl
                    label={__('Attachment Zoom', 'frontenda-blocks')}
                    value={attachment.zoom || DEFAULT_ZOOM}
                    onChange={(value?: number) => {
                        setAttributes({
                            media: {
                                ...media,
                                attachment: {
                                    ...attachment,
                                    zoom: value || DEFAULT_ZOOM,
                                },
                            }
                        });
                    }}
                    min={1}
                    max={3}
                    step={0.1}
                    allowReset={false}
                />
            ) : null}

            {(media.type === 'video-embed' || media.type === 'video-modal') && media.origin === 'embed' ? (
                <TextControl
                    label={__('Embed URL', 'frontenda-blocks')}
                    help={__('Paste a YouTube, Vimeo, or another oEmbed-supported URL.', 'frontenda-blocks')}
                    value={media.embedUrl}
                    onChange={(value: string) => {
                        setAttributes({ media: { ...media, embedUrl: value } });
                    }}
                />
            ) : null}

            {(media.type === 'video-embed' || media.type === 'video-modal') && media.origin === 'file' ? (
                <BaseControl label={__('Video File', 'frontenda-blocks')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectVideoFile}
                            allowedTypes={['video']}
                            value={attachment.id}
                            render={({ open }: { open: () => void }) => (
                                <div className="flex flex-col gap-2">
                                    {attachment.id && attachmentUrl ? (
                                        <video
                                            src={attachmentUrl}
                                            controls
                                            style={{ width: '100%', maxHeight: '180px', borderRadius: '4px', background: '#000' }}
                                        />
                                    ) : null}
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" onClick={open}>
                                            {attachment.id ? __('Replace Video', 'frontenda-blocks') : __('Select Video', 'frontenda-blocks')}
                                        </Button>
                                        {attachment.id ? (
                                            <Button
                                                variant="link"
                                                isDestructive
                                                onClick={() => {
                                                    setAttributes({
                                                        media: {
                                                            ...media,
                                                            attachment: createDefaultImageParams(),
                                                        },
                                                    });
                                                }}
                                            >
                                                {__('Remove Video', 'frontenda-blocks')}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                </BaseControl>
            ) : null}

            {(media.type === 'video-embed' || media.type === 'video-modal') ? (
                <BaseControl label={__('Poster Image', 'frontenda-blocks')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectPoster}
                            allowedTypes={['image']}
                            value={poster.id}
                            render={({ open }: { open: () => void }) => (
                                <div className="flex items-center text-center gap-2">
                                    <Button variant="secondary" onClick={open}>
                                        {poster.id ? __('Replace Poster', 'frontenda-blocks') : __('Select Poster', 'frontenda-blocks')}
                                    </Button>
                                    {poster.id ? (
                                        <Button
                                            variant="link"
                                            isDestructive
                                            onClick={() => {
                                                setAttributes({
                                                    media: {
                                                        ...media,
                                                        poster: createDefaultImageParams(),
                                                    },
                                                });
                                            }}
                                        >
                                            {__('Remove Poster', 'frontenda-blocks')}
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                </BaseControl>
            ) : null}

            {(media.type === 'video-embed' || media.type === 'video-modal') && poster.id && posterUrl ? (
                <BaseControl
                    label={__('Poster Focal Point', 'frontenda-blocks')}
                    help={__('Choose the visible focus area for the selected poster image.', 'frontenda-blocks')}
                >
                    <ZoomableFocalPointPicker
                        url={posterUrl}
                        focalPoint={poster.focalPoint || DEFAULT_FOCAL_POINT}
                        zoom={poster.zoom || DEFAULT_ZOOM}
                        onChange={(value: FocalPoint) => {
                            setAttributes({
                                media: {
                                    ...media,
                                    poster: {
                                        ...poster,
                                        focalPoint: value,
                                    },
                                }
                            });
                        }}
                    />
                </BaseControl>
            ) : null}

            {(media.type === 'video-embed' || media.type === 'video-modal') && poster.id ? (
                <RangeControl
                    label={__('Poster Zoom', 'frontenda-blocks')}
                    value={poster.zoom || DEFAULT_ZOOM}
                    onChange={(value?: number) => {
                        setAttributes({
                            media: {
                                ...media,
                                poster: {
                                    ...poster,
                                    zoom: value || DEFAULT_ZOOM,
                                },
                            }
                        });
                    }}
                    min={1}
                    max={3}
                    step={0.1}
                    allowReset={false}
                />
            ) : null}

            <TextareaControl
                label={__('Caption', 'frontenda-blocks')}
                help={__('Optional caption displayed with the selected media.', 'frontenda-blocks')}
                value={caption.text}
                rows={3}
                onChange={(value) => {
                    const nextValue = value ?? '';
                    setAttributes({ media: { ...media, caption: { ...caption, text: nextValue } } });
                }}
            />

            {caption.text ? <SelectControl
                label={__('Caption Position', 'frontenda-blocks')}
                help={__('Caption position on the media.', 'frontenda-blocks')}
                value={`${caption.orientation.x}:${caption.orientation.y}` as const}
                options={[
                    { label: __('Right', 'frontenda-blocks') + ' ' + __('Top', 'frontenda-blocks'), value: 'right:top' },
                    { label: __('Left', 'frontenda-blocks') + ' ' + __('Top', 'frontenda-blocks'), value: 'left:top' },
                    { label: __('Right', 'frontenda-blocks') + ' ' + __('Bottom', 'frontenda-blocks'), value: 'right:bottom' },
                    { label: __('Left', 'frontenda-blocks') + ' ' + __('Bottom', 'frontenda-blocks'), value: 'left:bottom' },
                ]}
                onChange={(value: `${SectionMedia['caption']['orientation']['x']}:${SectionMedia['caption']['orientation']['y']}`) => {
                    const [x, y] = value.split(':') as [SectionMedia['caption']['orientation']['x'], SectionMedia['caption']['orientation']['y']];
                    setAttributes({ media: { ...media, caption: { ...caption, orientation: { x, y } } } });
                }}
            /> : null}

            {media.type === 'gallery' ? (
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={onSelectGallery}
                        allowedTypes={['image']}
                        multiple
                        gallery
                        value={media.gallery.images.map((image) => image.id)}
                        render={({ open }: { open: () => void }) => (
                            <div className="flex items-center text-center gap-2">
                                <Button variant="secondary" onClick={open}>
                                    {media.gallery.images.length ? __('Edit Gallery', 'frontenda-blocks') : __('Select Gallery Images', 'frontenda-blocks')}
                                </Button>
                                {media.gallery.images.length ? (
                                    <Button
                                        variant="link"
                                        isDestructive
                                        onClick={() => {
                                            setAttributes({ media: { ...media, gallery: { ...media.gallery, images: [] } } });
                                        }}
                                    >
                                        {__('Clear Gallery', 'frontenda-blocks')}
                                    </Button>
                                ) : null}
                            </div>
                        )}
                    />
                </MediaUploadCheck>
            ) : null}

            {poster.id && (media.type === 'video-embed' || media.type === 'video-modal') ? null : null}
        </PanelBody>
    );
}
