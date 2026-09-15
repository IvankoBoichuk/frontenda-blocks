export type GalleryImage = {
    id: number;
};

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TextElement = {
    text: string;
    level: HeadingLevel | 'span' | 'p';
};

export type HeadingElement = {
    text: string;
    level: HeadingLevel;
    icon?: { id: number } | null;
};

export type LayoutOption = {
    label: string;
    value: string;
};

export type ListItemFieldKey = 'subttl' | 'ttl' | 'text' | 'image' | 'icon' | 'link' | 'post';

export type FocalPoint = {
    x: number;
    y: number;
};

export type ImageParams = {
    id: number;
    focalPoint: FocalPoint;
    zoom: number;
};

export type ListItem<Meta extends Record<string, string> = Record<string, string>> = {
    ttl: HeadingElement | null;
    subttl: TextElement | null;
    text: string | null;
    image: ImageParams | null;
    icon: { id: number } | null;
    link: { url: string; text?: string } | null;
    post: number | null;
    meta: Meta | null;
};

export type SectionMedia = {
    type: 'img' | 'video-embed' | 'video-modal' | 'gallery';
    origin: 'file' | 'embed';
    attachment: ImageParams;
    poster: ImageParams;
    embedUrl: string;
    priority: 'high' | 'low';
    caption: {
        text: string;
        orientation: {
            x: 'left' | 'right';
            y: 'top' | 'bottom';
        };
    };
    gallery: {
        images: GalleryImage[];
        sliderSettings: {
            slidesPerView: number;
            autoplay: boolean;
        };
    };
};

export type SectionAttributes = {
    anchor?: string;
    layout?: string;
    layouts?: LayoutOption[];
    cardLayouts?: LayoutOption[];
    nickname?: string;
    variant: string;
    list?: {
        layout: string | null;
        fields?: ListItemFieldKey[];
        textIfEmpty: string | null;
        ttl?: HeadingElement | null;
        items: ListItem[];
    };
};

export type QuerySettings = {
    mode: 'automatic' | 'manual';
    postType: string;
    postIds: number[];
    perPage: number;
    orderBy: 'date' | 'title' | 'menu_order' | 'rand';
    order: 'asc' | 'desc';
};

export type QueryAttributes = {
    query?: QuerySettings;
};

export type ReviewsSettings = {
    source: 'comment' | 'product_review';
    mode: 'automatic' | 'manual';
    commentIds: number[];
    perPage: number;
    order: 'asc' | 'desc';
};

export type ReviewsAttributes = {
    reviews?: ReviewsSettings;
};

export type MediaSelection = {
    id: number;
    mime?: string;
    mime_type?: string;
    subtype?: string;
};
