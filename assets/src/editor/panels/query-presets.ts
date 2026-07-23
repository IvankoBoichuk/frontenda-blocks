import { wp } from '../wp';
import type { QueryArgs } from '../types';

const { __ } = wp.i18n;

export type SortOptionKey = 'date_asc' | 'date_desc' | 'deadline_asc' | 'title_asc' | 'title_desc';

type QueryPresetMetadata = {
    postType: string;
    defaultSort: SortOptionKey;
    supportsSchool: boolean;
    sortOptions: SortOptionKey[];
};

export type PresetConfig = {
    label: string;
    postType: string;
    description: string;
    defaultSort: SortOptionKey;
    supportsSchool: boolean;
    sortOptions: Array<{
        label: string;
        value: SortOptionKey;
    }>;
};

const QUERY_PRESET_METADATA: Record<string, QueryPresetMetadata> = {
    programs: {
        postType: 'program',
        defaultSort: 'date_asc',
        supportsSchool: true,
        sortOptions: ['date_asc', 'date_desc', 'deadline_asc', 'title_asc', 'title_desc'],
    },
    articles: {
        postType: 'post',
        defaultSort: 'date_desc',
        supportsSchool: true,
        sortOptions: ['date_desc', 'date_asc', 'title_asc', 'title_desc'],
    },
    lecturers: {
        postType: 'person',
        defaultSort: 'title_asc',
        supportsSchool: true,
        sortOptions: ['title_asc', 'title_desc'],
    },
    school_team: {
        postType: 'person',
        defaultSort: 'title_asc',
        supportsSchool: true,
        sortOptions: ['title_asc', 'title_desc'],
    },
    leadership: {
        postType: 'person',
        defaultSort: 'title_asc',
        supportsSchool: true,
        sortOptions: ['title_asc', 'title_desc'],
    },
};

const PRESET_LABELS: Record<string, { label: string; description: string }> = {
    programs: {
        label: __('Programs', 'frontenda-blocks'),
        description: __('A collection of programs with school and date filters.', 'frontenda-blocks'),
    },
    articles: {
        label: __('Articles', 'frontenda-blocks'),
        description: __('A collection of articles with manual selection or via WP_Query.', 'frontenda-blocks'),
    },
    lecturers: {
        label: __('Lecturers', 'frontenda-blocks'),
        description: __('A collection of lecturers displayed as a card grid.', 'frontenda-blocks'),
    },
    school_team: {
        label: __('School team', 'frontenda-blocks'),
        description: __('A collection of school team members with a dedicated preset.', 'frontenda-blocks'),
    },
    leadership: {
        label: __('Leadership', 'frontenda-blocks'),
        description: __('A collection of leadership team members with a dedicated preset.', 'frontenda-blocks'),
    },
};

const SORT_OPTION_LABELS: Record<SortOptionKey, string> = {
    date_asc: __('By start date: nearest first', 'frontenda-blocks'),
    date_desc: __('By start date: latest first', 'frontenda-blocks'),
    deadline_asc: __('By deadline date', 'frontenda-blocks'),
    title_asc: __('By title: A-Z', 'frontenda-blocks'),
    title_desc: __('By title: Z-A', 'frontenda-blocks'),
};

const ARTICLE_SORT_OPTION_LABELS: Partial<Record<SortOptionKey, string>> = {
    date_asc: __('By date: oldest first', 'frontenda-blocks'),
    date_desc: __('By date: newest first', 'frontenda-blocks'),
};

const getSortOptionLabel = (preset: string, sortOption: SortOptionKey): string => {
    return (preset === 'articles' ? ARTICLE_SORT_OPTION_LABELS[sortOption] : null)
        ?? SORT_OPTION_LABELS[sortOption];
};

export const PRESETS: Record<string, PresetConfig> = Object.entries(QUERY_PRESET_METADATA).reduce<Record<string, PresetConfig>>(
    (presets, [key, preset]) => {
        const labels = PRESET_LABELS[key] ?? { label: key, description: '' };

        presets[key] = {
            ...labels,
            postType: preset.postType,
            defaultSort: preset.defaultSort,
            supportsSchool: preset.supportsSchool,
            sortOptions: preset.sortOptions.map((sortOption) => ({
                label: getSortOptionLabel(key, sortOption),
                value: sortOption,
            })),
        };

        return presets;
    },
    {}
);

export function buildSortArgs(key: SortOptionKey): QueryArgs {
    switch (key) {
        case 'date_desc':
            return {
                meta_key: 'date_start',
                meta_type: 'DATETIME',
                orderby: 'meta_value',
                order: 'DESC',
            };
        case 'deadline_asc':
            return {
                meta_key: 'deadline',
                meta_type: 'DATETIME',
                orderby: 'meta_value',
                order: 'ASC',
            };
        case 'title_asc':
            return {
                orderby: 'title',
                order: 'ASC',
            };
        case 'title_desc':
            return {
                orderby: 'title',
                order: 'DESC',
            };
        case 'date_asc':
        default:
            return {
                meta_key: 'date_start',
                meta_type: 'DATETIME',
                orderby: 'meta_value',
                order: 'ASC',
            };
    }
}

export function getSortKeyFromArgs(args: QueryArgs, defaultSort: SortOptionKey): SortOptionKey {
    if (args.orderby === 'title') {
        return args.order === 'DESC' ? 'title_desc' : 'title_asc';
    }

    if (args.meta_key === 'deadline' && args.orderby === 'meta_value') {
        return 'deadline_asc';
    }

    if (args.meta_key === 'date_start' && args.orderby === 'meta_value') {
        return args.order === 'DESC' ? 'date_desc' : 'date_asc';
    }

    if (args.orderby === 'date') {
        return args.order === 'ASC' ? 'date_asc' : 'date_desc';
    }

    return defaultSort;
}
