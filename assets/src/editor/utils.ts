import type { Post } from '@wordpress/core-data';
import type { ListItem } from './types';
import { wp } from './wp';

const { __ } = wp.i18n;

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

export function getPostLabel(post?: Post): string {
    return post?.title.rendered || __('Untitled', 'frontenda-blocks');
}
