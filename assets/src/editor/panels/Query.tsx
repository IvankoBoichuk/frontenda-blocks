import { wp } from '../wp';
import type {
    LayoutOption,
    QueryArgs,
    SectionPanelProps,
} from '../types';
import { getCardLayoutOptions, usePostTypeOptions, useSchoolOptions } from '../utils';
import { PRESETS, buildSortArgs, getSortKeyFromArgs, type SortOptionKey } from './query-presets';
import LayoutSelector from './LayoutSelector';

const { __ } = wp.i18n;
const { createElement } = wp.element;
const {
    PanelBody,
    SelectControl,
    RangeControl,
    Button
} = wp.components;

type SectionQuery = NonNullable<SectionPanelProps['attributes']['query']>;

// ─── Hook ────────────────────────────────────────────────────────────────────

function useQueryPanel({ attributes, setAttributes }: SectionPanelProps) {
    const { query, variant } = attributes;
    const sectionQuery = query as SectionQuery;
    const args: QueryArgs = sectionQuery.args;
    const sourceMode = sectionQuery.sourceMode;
    const presetConfig = PRESETS[variant] ?? PRESETS['articles'];
    const currentSortKey = getSortKeyFromArgs(args, presetConfig.defaultSort);
    const selectedPostIds = sourceMode === 'manual' ? (args.post__in ?? []) : [];

    function normalizeQueryArgs(nextArgs: QueryArgs, nextSourceMode: SectionQuery['sourceMode'] = sourceMode): QueryArgs {
        const normalizedArgs: QueryArgs = {
            ...nextArgs,
            ignore_sticky_posts: true,
            post_status: 'publish',
            post_type: presetConfig.postType,
        };

        if (nextSourceMode !== 'manual') {
            delete normalizedArgs.post__in;
        }

        return normalizedArgs;
    }

    function updateQuery(nextQuery: Partial<SectionQuery>, nextArgs: QueryArgs, nextSourceMode: SectionQuery['sourceMode'] = sourceMode): void {
        setAttributes({
            query: {
                ...sectionQuery,
                ...nextQuery,
                args: normalizeQueryArgs(nextArgs, nextSourceMode),
            },
        });
    }

    function updateSelectedPosts(nextIds: number[]): void {
        updateQuery({}, { ...args, post__in: nextIds });
    }

    function updateManualPost(index: number, value: string): void {
        const nextIds = selectedPostIds.slice();
        nextIds[index] = parseInt(value, 10) || 0;
        updateSelectedPosts(nextIds);
    }

    function addManualPost(): void {
        updateSelectedPosts(selectedPostIds.concat([0]));
    }

    function removeManualPost(index: number): void {
        updateSelectedPosts(selectedPostIds.filter((_, i) => i !== index));
    }

    function updateLayout(nextLayout: string | null): void {
        setAttributes({
            query: {
                ...sectionQuery,
                layout: nextLayout,
            },
        });
    }

    return {
        sectionQuery,
        args,
        sourceMode,
        schoolId: sectionQuery.schoolId,
        presetConfig,
        currentSortKey,
        selectedPostIds,
        updateQuery,
        updateManualPost,
        addManualPost,
        removeManualPost,
        updateLayout,
    };
}

// ─── Sub-component ────────────────────────────────────────────────────────────

type ManualPostSelectorProps = {
    selectedPostIds: number[];
    postOptions: { label: string; value: string }[];
    onUpdate: (index: number, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
};

function ManualPostSelector({ selectedPostIds, postOptions, onUpdate, onAdd, onRemove }: ManualPostSelectorProps) {
    return <div>
        {selectedPostIds.length ? (
            selectedPostIds.map((postId, index) => (
                <div
                    key={`manual-post-${index}`}
                    style={{
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #e0e0e0',
                    }}
                >
                    <SelectControl
                        label={`${__('Post', 'frontenda-blocks')} #${String(index + 1)}`}
                        value={String(postId)}
                        options={postOptions}
                        onChange={(value: string) => onUpdate(index, value)}
                    />
                    <Button
                        variant="secondary"
                        isDestructive
                        onClick={() => onRemove(index)}
                    >
                        {__('Remove', 'frontenda-blocks')}
                    </Button>
                </div>
            ))
        ) : (
            <p>{__('No posts selected yet.', 'frontenda-blocks')}</p>
        )}
        <Button variant="primary" onClick={onAdd}>
            {__('Add post', 'frontenda-blocks')}
        </Button>
    </div>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Query(props: SectionPanelProps) {
    if (!props.attributes.query) return null;

    const {
        sectionQuery,
        args,
        sourceMode,
        schoolId,
        presetConfig,
        currentSortKey,
        selectedPostIds,
        updateQuery,
        updateManualPost,
        addManualPost,
        removeManualPost,
        updateLayout,
    } = useQueryPanel(props);

    const postOptions = usePostTypeOptions(presetConfig.postType);
    const schoolOptions = useSchoolOptions();
    const layoutOptions: LayoutOption[] = getCardLayoutOptions(presetConfig.postType);

    return <PanelBody title={__('Collection settings', 'frontenda-blocks')} initialOpen>
        <SelectControl
            label={__('Post source', 'frontenda-blocks')}
            value={sourceMode}
            options={[
                { label: __('Automatic', 'frontenda-blocks'), value: 'query' },
                { label: __('Manual selection', 'frontenda-blocks'), value: 'manual' },
            ]}
            onChange={(value: 'query' | 'manual') => {
                updateQuery(
                    { sourceMode: value },
                    {
                        ...sectionQuery.args,
                        orderby: value === 'manual' ? 'post__in' : args.orderby,
                        post__in: value === 'manual' ? (sectionQuery.args.post__in ?? []) : sectionQuery.args.post__in,
                    },
                    value
                );
            }}
            help={sourceMode === 'manual'
                ? __('In manual mode, the card order follows the order of the items below.', 'frontenda-blocks')
                : __('In automatic mode, the block displays posts according to the filtering and sorting rules.', 'frontenda-blocks')}
        />
        {sourceMode === 'query' && presetConfig.supportsSchool && (
            <SelectControl
                label={__('School', 'frontenda-blocks')}
                value={String(schoolId ?? 0)}
                options={schoolOptions}
                onChange={(value: string) => {
                    const nextSchoolId = value === '0' ? undefined : Number(value);
                    const meta_query: QueryArgs['meta_query'] = nextSchoolId
                        ? [{ key: 'school', value: nextSchoolId, compare: '=' }]
                        : [];

                    updateQuery(
                        { schoolId: nextSchoolId },
                        { ...sectionQuery.args, meta_query }
                    );
                }}
            />
        )}
        {sourceMode === 'query' && (
            <RangeControl
                label={__('Quantity', 'frontenda-blocks')}
                value={args.posts_per_page || 6}
                onChange={(value: number | undefined) => {
                    updateQuery({}, { ...args, posts_per_page: value || 1 });
                }}
                min={1}
                max={12}
                allowReset={false}
            />
        )}
        {sourceMode === 'query' && (
            <SelectControl
                label={__('Sorting', 'frontenda-blocks')}
                value={currentSortKey}
                options={presetConfig.sortOptions}
                onChange={(value: SortOptionKey) => {
                    updateQuery({}, { ...args, ...buildSortArgs(value) });
                }}
            />
        )}
        <LayoutSelector
            label={__('Card layout', 'frontenda-blocks')}
            value={sectionQuery.layout ?? null}
            layouts={layoutOptions}
            onChange={updateLayout}
        />
        {sourceMode === 'manual' && (
            <ManualPostSelector
                selectedPostIds={selectedPostIds}
                postOptions={postOptions}
                onUpdate={updateManualPost}
                onAdd={addManualPost}
                onRemove={removeManualPost}
            />
        )}
    </PanelBody>;
}
