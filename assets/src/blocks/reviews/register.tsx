import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import reviewsMetadata from '../../../../blocks/reviews/block.json';
import type { ReviewsAttributes, ReviewsSettings } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement, Fragment, useState } = wp.element;
const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const { Button, ComboboxControl, RadioControl, RangeControl, SelectControl, Spinner } = wp.components;
const { __ } = wp.i18n;

type CommentRecord = {
    id: number;
    author_name?: string;
};

const DEFAULT_REVIEWS: ReviewsSettings = {
    source: 'comment',
    mode: 'automatic',
    commentIds: [],
    perPage: 6,
    order: 'desc',
};

const getCommentLabel = (comment?: CommentRecord): string =>
    comment?.author_name || (comment ? `#${comment.id}` : __('Comment not found', 'frontenda-blocks'));

export function registerReviewsBlock(): void {
    registerBlockType<ReviewsAttributes>(
        reviewsMetadata as BlockConfiguration<ReviewsAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<ReviewsAttributes>) => {
                const reviews = { ...DEFAULT_REVIEWS, ...attributes.reviews };
                const [search, setSearch] = useState('');
                const update = (next: Partial<ReviewsSettings>) => setAttributes({
                    reviews: { ...reviews, ...next },
                });
                const comments = useSelect((select) => {
                    const request: Record<string, unknown> = {
                        per_page: reviews.mode === 'manual' ? 100 : reviews.perPage,
                        order: reviews.order,
                        status: 'approve',
                        type: reviews.source === 'product_review' ? 'review' : 'comment',
                    };

                    if (reviews.mode === 'manual' && search) {
                        request.search = search;
                    }

                    return select(store).getEntityRecords('root', 'comment', request) as CommentRecord[] | null;
                }, [reviews.source, reviews.mode, reviews.perPage, reviews.order, search]);
                const selectedComments = useSelect((select) => {
                    if (reviews.commentIds.length === 0) {
                        return [];
                    }

                    return select(store).getEntityRecords('root', 'comment', {
                        include: reviews.commentIds,
                        per_page: reviews.commentIds.length,
                        status: 'approve',
                        type: reviews.source === 'product_review' ? 'review' : 'comment',
                    }) as CommentRecord[] | null ?? [];
                }, [reviews.source, reviews.commentIds.join(',')]);
                const selectedById = new Map(selectedComments.map((comment) => [comment.id, comment]));
                const move = (index: number, offset: number) => {
                    const destination = index + offset;
                    if (destination < 0 || destination >= reviews.commentIds.length) {
                        return;
                    }

                    const commentIds = [...reviews.commentIds];
                    [commentIds[index], commentIds[destination]] = [commentIds[destination]!, commentIds[index]!];
                    update({ commentIds });
                };

                return <div {...useBlockProps({ className: 'grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4' })}>
                    <strong>{__('Reviews query', 'frontenda-blocks')}</strong>
                    <SelectControl
                        __next40pxDefaultSize
                        label={__('Comment type', 'frontenda-blocks')}
                        value={reviews.source}
                        options={[
                            { label: __('Comments', 'frontenda-blocks'), value: 'comment' },
                            { label: __('Product reviews', 'frontenda-blocks'), value: 'product_review' },
                        ]}
                        onChange={(source: ReviewsSettings['source']) => update({ source, commentIds: [] })}
                    />
                    <RadioControl
                        label={__('Selection mode', 'frontenda-blocks')}
                        selected={reviews.mode}
                        options={[
                            { label: __('Automatic', 'frontenda-blocks'), value: 'automatic' },
                            { label: __('Manual', 'frontenda-blocks'), value: 'manual' },
                        ]}
                        onChange={(mode: string) => update({ mode: mode === 'manual' ? 'manual' : 'automatic' })}
                    />
                    {reviews.mode === 'automatic' ? <>
                        <RangeControl
                            label={__('Number of comments', 'frontenda-blocks')}
                            value={reviews.perPage}
                            min={1}
                            max={24}
                            onChange={(perPage?: number) => update({ perPage: perPage ?? DEFAULT_REVIEWS.perPage })}
                        />
                        <SelectControl
                            __next40pxDefaultSize
                            label={__('Direction', 'frontenda-blocks')}
                            value={reviews.order}
                            options={[
                                { label: __('Newest first', 'frontenda-blocks'), value: 'desc' },
                                { label: __('Oldest first', 'frontenda-blocks'), value: 'asc' },
                            ]}
                            onChange={(order: ReviewsSettings['order']) => update({ order })}
                        />
                    </> : <>
                        <ComboboxControl
                            label={__('Add comments', 'frontenda-blocks')}
                            value={null}
                            options={(comments ?? [])
                                .filter((comment) => !reviews.commentIds.includes(comment.id))
                                .map((comment) => ({ label: getCommentLabel(comment), value: String(comment.id) }))}
                            onFilterValueChange={setSearch}
                            onChange={(value: string | null | undefined) => {
                                const commentId = Number(value);
                                if (commentId > 0 && !reviews.commentIds.includes(commentId)) {
                                    update({ commentIds: [...reviews.commentIds, commentId] });
                                }
                            }}
                        />
                        <div className="grid gap-2">
                            {reviews.commentIds.map((commentId, index) => <div
                                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2"
                                key={commentId}
                            >
                                <span className="min-w-0 flex-1 truncate">{getCommentLabel(selectedById.get(commentId))}</span>
                                <Button icon="arrow-up-alt2" label={__('Move up', 'frontenda-blocks')} disabled={index === 0} onClick={() => move(index, -1)} />
                                <Button icon="arrow-down-alt2" label={__('Move down', 'frontenda-blocks')} disabled={index === reviews.commentIds.length - 1} onClick={() => move(index, 1)} />
                                <Button icon="no-alt" label={__('Remove', 'frontenda-blocks')} isDestructive onClick={() => update({
                                    commentIds: reviews.commentIds.filter((id) => id !== commentId),
                                })} />
                            </div>)}
                        </div>
                    </>}
                    {comments === null && <Spinner />}
                    <p>{__('Only approved comments are returned.', 'frontenda-blocks')}</p>
                </div>;
            },
            save: () => null,
        },
    );
}
