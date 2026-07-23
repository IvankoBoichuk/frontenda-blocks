import metadata from '../../../blocks/section/block.json';
import { wp } from './wp';
import type {
    AllowedElement,
    LayoutOption,
    ListItem,
    SectionAttributes,
    SectionVariationMetadata,
} from './types';
import type { Post } from '@wordpress/core-data';
import { PRESETS } from './panels/query-presets';
const { __ } = wp.i18n;
const { useSelect } = wp.data;
const { store } = wp.coreData;

type SectionVariationConfig = {
    availableElements?: AllowedElement[];
    defaultElements?: AllowedElement[];
};

type SectionBlockConfig = {
    faConfig?: {
        variations?: Record<string, SectionVariationConfig>;
    };
};

const defaultLayoutOptions = (metadata.attributes?.layouts?.default || []) as LayoutOption[];
const sectionVariationConfig = (metadata as SectionBlockConfig).faConfig?.variations ?? {};
const emptyAllowedElements: AllowedElement[] = [];

const variationLayoutOptions = ((metadata.variations || []) as SectionVariationMetadata[]).reduce<Record<string, LayoutOption[]>>((accumulator, variation) => {
    if (variation.attributes?.layouts?.length) {
        accumulator[variation.name] = variation.attributes.layouts;
    }

    return accumulator;
}, {});

export const parseItems = (value: string): string[] => value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyItems = (items?: string[]): string => (items || []).join('\n');

export const createEmptyListItem = (): ListItem => ({
    ttl: {
        text: '',
        level: 'h3',
    },
    subttl: {
        text: '',
        level: 'span',
    },
    text: '',
    image: {
        id: 0,
        focalPoint: {
            x: 0.5,
            y: 0.5,
        },
        zoom: 1,
    },
    icon: {
        id: 0,
    },
    link: {
        url: '',
        text: '',
    },
    post: null,
    meta: {},
});

const SWIPER_DEFAULT: NonNullable<SectionAttributes['swiper']> = { slidesPerView: 3, autoplay: false, loop: false };

export const createDefaultSectionQuery = (variant: string): NonNullable<SectionAttributes['query']> => {
    const preset = variant in PRESETS ? variant as NonNullable<SectionAttributes['query']>['preset'] : 'articles';
    const presetConfig = PRESETS[preset];

    return {
        preset,
        sourceMode: 'query',
        args: {
            ignore_sticky_posts: true,
            posts_per_page: 6,
            post_status: 'publish',
            post_type: presetConfig.postType,
        },
    };
};

export const getDefaultAttributesForElements = (
    variant: string,
    elements: AllowedElement[]
): Partial<SectionAttributes> => {
    const attributes: Partial<SectionAttributes> = {};

    for (const element of elements) {
        switch (element) {
            case 'ttl':
                attributes.ttl = { text: '', level: 'h2' };
                break;
            case 'subttl':
                attributes.subttl = { text: '', level: 'span' };
                break;
            case 'media':
                attributes.media = {
                    type: 'img',
                    origin: 'file',
                    attachment: { id: 0, focalPoint: { x: 0.5, y: 0.5 }, zoom: 1 },
                    poster: { id: 0, focalPoint: { x: 0.5, y: 0.5 }, zoom: 1 },
                    embedUrl: '',
                    caption: { text: '', orientation: { x: 'left', y: 'top' } },
                    gallery: { images: [], sliderSettings: { slidesPerView: 1, autoplay: false } },
                };
                break;
            case 'list':
                attributes.list = {
                    layout: null,
                    textIfEmpty: null,
                    ttl: null,
                    items: [],
                };
                break;
            case 'query':
                attributes.query = createDefaultSectionQuery(variant);
                attributes.swiper = SWIPER_DEFAULT;
                break;
        }
    }

    return attributes;
};

type CardLayoutPostType = 'post' | 'person' | 'program';

const availableCardLayouts: Record<CardLayoutPostType, LayoutOption[]> = {
    post: [
        {
            value: 'post-1',
            label: __('Post Tease 1', 'frontenda-blocks'),
        },
        {
            value: 'post-2',
            label: __('Post Tease 2', 'frontenda-blocks'),
        },
        {
            value: 'post-3',
            label: __('Post Tease 3', 'frontenda-blocks'),
        },
    ],
    person: [
        {
            value: 'person-1',
            label: __('Person Tease 1', 'frontenda-blocks'),
        },
        {
            value: 'person-2',
            label: __('Person Tease 2', 'frontenda-blocks'),
        },
    ],
    program: [
        {
            value: 'program-1',
            label: __('Program Tease 1', 'frontenda-blocks'),
        },
        {
            value: 'program-2',
            label: __('Program Tease 2', 'frontenda-blocks'),
        },
        {
            value: 'program-3',
            label: __('Program Tease 3', 'frontenda-blocks'),
        },
    ],
};

export const getLayoutOptions = (variant: string, layouts: LayoutOption[]): LayoutOption[] => {
    if (variationLayoutOptions[variant]?.length) {
        return variationLayoutOptions[variant];
    }

    if (layouts.length) {
        return layouts;
    }

    return defaultLayoutOptions;
};

export const getAvailableElements = (variant: string, fallback: AllowedElement[]): AllowedElement[] => {
    return sectionVariationConfig[variant]?.availableElements ?? fallback;
};

export const getDefaultElements = (variant: string): AllowedElement[] => {
    return sectionVariationConfig[variant]?.defaultElements ?? emptyAllowedElements;
};

export const getCardLayoutOptions = (postType: string): LayoutOption[] => {
    if (!(postType in availableCardLayouts)) {
        return [];
    }

    return availableCardLayouts[postType as CardLayoutPostType];
};

export function getPostLabel(post?: Post): string {
    return post?.title.rendered || __('Untitled', 'frontenda-blocks');
}

export const usePostTypeOptions = (
    postType: string,
    placeholder = { label: __<string>('Select an option', 'frontenda-blocks'), value: '0' }
) => {
    const posts = useEntityRecords(postType);
    return getOptions(posts, placeholder);
};

export const getPost = (postId: number) => {
    return useSelect((select) => {
        return select(store).getEntityRecord('postType', 'post', postId);
    }, [postId]);
}

export const usePostOptions = () =>
    usePostTypeOptions('post', { label: __('All Posts', 'frontenda-blocks'), value: '0' });

export const useSchoolOptions = () =>
    usePostTypeOptions('school', { label: __('All Schools', 'frontenda-blocks'), value: '0' });

const getOptions = (posts: Post[], placeholder = {
    label: __<string>('Select an option', 'frontenda-blocks'),
    value: '0',
}) => {
    return [
        placeholder,
        ...posts.map((post) => ({
            label: getPostLabel(post),
            value: String(post.id),
        })),
    ];
}

const useEntityRecords = (postType: string) => {
    return useSelect((select) => {
        return select(store).getEntityRecords<Post>('postType', postType, {
            per_page: -1,
            orderby: 'title',
            order: 'asc',
        }) || [];
    }, [postType]);
}
