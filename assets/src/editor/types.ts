import type { BlockEditProps } from "@wordpress/blocks";
import { wp } from '@/editor/wp';
const { __ } = wp.i18n;

export const ALLOWED_ELEMENTS = {
    ttl : __('Title', 'frontenda-blocks'),
    subttl : __('Subtitle', 'frontenda-blocks'),
    text : __('Text', 'frontenda-blocks'),
    buttons : __('Buttons', 'frontenda-blocks'),
    media : __('Media', 'frontenda-blocks'),
    list : __('List', 'frontenda-blocks'),
    query : __('Query', 'frontenda-blocks'),
} as const;

export type AllowedElement = keyof typeof ALLOWED_ELEMENTS;

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

export type ListItem<Meta extends { [key: string]: string } = {}> = {
    ttl: HeadingElement | null;
    subttl: TextElement | null;
    text: string | null;
    image: ImageParams | null;
    icon: { id: number } | null;
    link: { url: string; text?: string } | null;
    post: number | null;
    meta: Meta | null;
};

export type SectionVariationMetadata = {
    name: string;
    attributes?: {
        layouts?: LayoutOption[];
    };
};

export type EditorBlockNode = {
    clientId: string;
    name: string;
    innerBlocks?: EditorBlockNode[];
};

export type PanelProps<T> = {
    attributes: T;
    setAttributes: (attributes: Partial<T>) => void;
};

export type SectionPanelProps = PanelProps<SectionAttributes>;
export type QuotePanelProps = PanelProps<QuoteAttributes>;
export type SchoolPanelProps = PanelProps<SchoolAttributes>;
export type CentersPanelProps = PanelProps<CentersAttributes>;

export type FocalPoint = {
    x: number;
    y: number;
};

export type ImageParams = {
    id: number;
    focalPoint: FocalPoint;
    zoom: number;
};

export type SectionMedia = {
    type: 'img' | 'video-embed' | 'video-modal' | 'gallery';
    origin: 'file' | 'embed';
    attachment: ImageParams;
    poster: ImageParams;
    embedUrl: string;
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
        }
    };
};

export type SectionEditProps = BlockEditProps<SectionAttributes>;
export type QuoteEditProps = BlockEditProps<QuoteAttributes>;
export type SchoolEditProps = BlockEditProps<SchoolAttributes>;
export type CentersEditProps = BlockEditProps<CentersAttributes>;
export type ArchiveEditProps = BlockEditProps<ArchiveAttributes>;
export type TextEditProps = BlockEditProps<TextAttributes>;
export type ListEditProps = BlockEditProps<ListAttributes>;
export type CtaEditProps = BlockEditProps<CtaAttributes>;
export type CtaListsEditProps = BlockEditProps<CtaListsAttributes>;

export type QueryArgs = {
    posts_per_page?: number;
    ignore_sticky_posts?: boolean;
    meta_key?: string;
    meta_type?: string;
    meta_query?: Array<{
        key: string;
        value: number;
        compare: '=';
    }>;
    orderby?: string | string[];
    order?: 'ASC' | 'DESC' | string[];
    post_status?: 'publish' | string;
    post_type?: string;
    post__in?: number[];
};

export type QuoteAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    subttl?: TextElement;
    text?: string;
    media?: SectionMedia;
    personId?: number;
    allowedElements?: AllowedElement[];
}

export type SchoolAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    subttl?: TextElement;
    text?: string;
    media?: SectionMedia;
    schoolId?: number;
    allowedElements?: AllowedElement[];
}

export type CentersAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    text?: string;
    schoolId?: number;
    allowedElements?: AllowedElement[];
}

export type ArchiveAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    subttl?: TextElement;
    text?: string;
    media?: SectionMedia;
    allowedElements?: AllowedElement[];
    variant: string;
    layout?: string;
}

export type SectionAttributes = {
    clientId?: string;
    anchor?: string;
    name?: string;
    ttl?: HeadingElement;
    subttl?: TextElement;
    text?: string;
    media?: SectionMedia;
    list?: {
        layout: string | null;
        textIfEmpty: string | null;
        ttl?: HeadingElement | null;
        items: ListItem[];
    };
    layout?: string;
    layouts?: LayoutOption[];
    nickname?: string;
    variant: string;
    allowedElements?: AllowedElement[];
    query?: {
        preset: 'programs' | 'articles' | 'lecturers' | 'school_team' | 'leadership';
        sourceMode: 'query' | 'manual';
        schoolId?: number; // for query source mode
        args: QueryArgs;
        layout?: string | null;
    };
    swiper?: {
        slidesPerView: number;
        autoplay: boolean;
        loop: boolean;
    };
};

export type TextAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    text?: string;
    media?: SectionMedia;
    layout?: string;
    layouts?: LayoutOption[];
};

export type ListAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    items?: ListItem[];
    layout?: string;
    layouts?: LayoutOption[];
};

export type CtaAttributes = {
    clientId?: string;
    anchor?: string;
    ttl?: HeadingElement;
    text?: string;
    media?: SectionMedia;
};

export type CtaListsAttributes = {
    clientId?: string;
    anchor?: string;
    background?: string;
};

export type MediaSelection = {
    id: number;
} & {
    [k: string]: any;
};

export type SectionLikeBlockProps = {
    clientId: string;
    attributes: SectionAttributes;
    setAttributes: (attributes: Partial<SectionAttributes>) => void;
};
