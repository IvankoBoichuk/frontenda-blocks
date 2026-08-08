import type { Post } from '@wordpress/core-data';
import type { QueryAttributes, QuerySettings } from '@/editor/types';
import { getPostLabel } from '@/editor/utils';
import { wp } from '@/editor/wp';

const { createElement, Fragment, useState } = wp.element;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const {
    Button,
    ComboboxControl,
    RadioControl,
    RangeControl,
    SelectControl,
    Spinner,
} = wp.components;
const { __ } = wp.i18n;

type PostType = {
    slug: string;
    name: string;
    viewable?: boolean;
};

type Props = {
    query?: QuerySettings;
    setAttributes: (attributes: QueryAttributes) => void;
};

const DEFAULT_QUERY: QuerySettings = {
    mode: 'automatic',
    postType: 'post',
    postIds: [],
    perPage: 6,
    orderBy: 'date',
    order: 'desc',
};

export default function QueryEditor({ query: rawQuery, setAttributes }: Props) {
    const query = { ...DEFAULT_QUERY, ...rawQuery };
    const [search, setSearch] = useState('');
    const update = (patch: Partial<QuerySettings>) => setAttributes({
        query: { ...query, ...patch },
    });

    const postTypes = useSelect((select) => {
        const records = select(store).getPostTypes({ per_page: -1 }) as PostType[] | null;

        return (records ?? []).filter((postType) => postType.viewable !== false);
    }, []);

    const posts = useSelect((select) => {
        const request: Record<string, string | number> = {
            per_page: query.mode === 'manual' ? 100 : query.perPage,
            orderby: ['date', 'title'].includes(query.orderBy) ? query.orderBy : 'date',
            order: query.order,
            status: 'publish',
        };

        if (query.mode === 'manual' && search) {
            request.search = search;
        }

        return select(store).getEntityRecords<Post>('postType', query.postType, request) ?? null;
    }, [query.mode, query.postType, query.perPage, query.orderBy, query.order, search]);

    const selectedPosts = useSelect((select) => {
        if (query.postIds.length === 0) {
            return [];
        }

        return select(store).getEntityRecords<Post>('postType', query.postType, {
            include: query.postIds,
            per_page: query.postIds.length,
        }) ?? [];
    }, [query.postType, query.postIds.join(',')]);

    const selectedById = new Map(selectedPosts.map((post) => [post.id, post]));
    const move = (index: number, offset: number) => {
        const destination = index + offset;
        if (destination < 0 || destination >= query.postIds.length) {
            return;
        }

        const postIds = [...query.postIds];
        [postIds[index], postIds[destination]] = [postIds[destination]!, postIds[index]!];
        update({ postIds });
    };

    return <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <strong>{__('Post query', 'frontenda-blocks')}</strong>

        <RadioControl
            label={__('Selection mode', 'frontenda-blocks')}
            selected={query.mode}
            options={[
                { label: __('Automatic', 'frontenda-blocks'), value: 'automatic' },
                { label: __('Manual', 'frontenda-blocks'), value: 'manual' },
            ]}
            onChange={(mode: string) => update({ mode: mode === 'manual' ? 'manual' : 'automatic' })}
        />

        <SelectControl
            label={__('Post type', 'frontenda-blocks')}
            value={query.postType}
            options={postTypes.map((postType) => ({ label: postType.name, value: postType.slug }))}
            onChange={(postType: string) => update({ postType, postIds: [] })}
        />

        {query.mode === 'automatic' ? <>
            <RangeControl
                label={__('Number of posts', 'frontenda-blocks')}
                value={query.perPage}
                min={1}
                max={24}
                onChange={(perPage?: number) => update({ perPage: perPage ?? DEFAULT_QUERY.perPage })}
            />
            <SelectControl
                label={__('Order by', 'frontenda-blocks')}
                value={query.orderBy}
                options={[
                    { label: __('Date', 'frontenda-blocks'), value: 'date' },
                    { label: __('Title', 'frontenda-blocks'), value: 'title' },
                    { label: __('Menu order', 'frontenda-blocks'), value: 'menu_order' },
                    { label: __('Random', 'frontenda-blocks'), value: 'rand' },
                ]}
                onChange={(orderBy: QuerySettings['orderBy']) => update({ orderBy })}
            />
            {query.orderBy !== 'rand' && <SelectControl
                label={__('Direction', 'frontenda-blocks')}
                value={query.order}
                options={[
                    { label: __('Descending', 'frontenda-blocks'), value: 'desc' },
                    { label: __('Ascending', 'frontenda-blocks'), value: 'asc' },
                ]}
                onChange={(order: QuerySettings['order']) => update({ order })}
            />}
        </> : <>
            <ComboboxControl
                label={__('Add posts', 'frontenda-blocks')}
                value={null}
                options={(posts ?? [])
                    .filter((post) => !query.postIds.includes(post.id))
                    .map((post) => ({ label: getPostLabel(post), value: String(post.id) }))}
                onFilterValueChange={setSearch}
                onChange={(value: string | null | undefined) => {
                    const postId = Number(value);
                    if (postId > 0 && !query.postIds.includes(postId)) {
                        update({ postIds: [...query.postIds, postId] });
                    }
                }}
            />
            <div className="grid gap-2">
                {query.postIds.map((postId, index) => <div
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2"
                    key={postId}
                >
                    <span className="min-w-0 flex-1 truncate">
                        {getPostLabel(selectedById.get(postId))}
                    </span>
                    <Button icon="arrow-up-alt2" label={__('Move up', 'frontenda-blocks')} disabled={index === 0} onClick={() => move(index, -1)} />
                    <Button icon="arrow-down-alt2" label={__('Move down', 'frontenda-blocks')} disabled={index === query.postIds.length - 1} onClick={() => move(index, 1)} />
                    <Button icon="no-alt" label={__('Remove', 'frontenda-blocks')} isDestructive onClick={() => update({
                        postIds: query.postIds.filter((id) => id !== postId),
                    })} />
                </div>)}
            </div>
        </>}

        {posts === null ? <Spinner /> : <div className="text-sm text-neutral-500">
            {query.mode === 'automatic'
                ? __('The query currently returns %d posts.', 'frontenda-blocks').replace('%d', String(posts.length))
                : __('Selected posts: %d', 'frontenda-blocks').replace('%d', String(query.postIds.length))}
        </div>}
    </div>;
}
