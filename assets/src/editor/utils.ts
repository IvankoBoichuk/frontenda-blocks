import type { Post } from '@wordpress/core-data';
import { wp } from './wp';
import type { LayoutOption, ListItem } from './types';

const { __ } = wp.i18n;
const { useSelect } = wp.data;
const { store } = wp.coreData;

export const createEmptyListItem = (): ListItem => ({
    ttl: { text: '', level: 'h3' },
    subttl: { text: '', level: 'span' },
    text: '',
    image: {
        id: 0,
        focalPoint: { x: 0.5, y: 0.5 },
        zoom: 1,
    },
    icon: { id: 0 },
    link: { url: '', text: '' },
    post: null,
    meta: {},
});

const personCardLayouts: LayoutOption[] = [
    { value: 'person-1', label: __('Person Tease 1', 'frontenda-blocks') },
    { value: 'person-2', label: __('Person Tease 2', 'frontenda-blocks') },
];

export const getCardLayoutOptions = (postType: string): LayoutOption[] =>
    postType === 'person' ? personCardLayouts : [];

export function getPostLabel(post?: Post): string {
    return post?.title.rendered || __('Untitled', 'frontenda-blocks');
}

export const usePostTypeOptions = (
    postType: string,
    placeholder = { label: __<string>('Select an option', 'frontenda-blocks'), value: '0' },
) => {
    const posts = useSelect((select) => {
        return select(store).getEntityRecords<Post>('postType', postType, {
            per_page: -1,
            orderby: 'title',
            order: 'asc',
        }) || [];
    }, [postType]);

    return [
        placeholder,
        ...posts.map((post) => ({
            label: getPostLabel(post),
            value: String(post.id),
        })),
    ];
};
