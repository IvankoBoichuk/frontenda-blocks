import sectionMetadata from '../../../../blocks/section/block.json';
import { wp } from '@/editor/wp';
import type { BlockTemplate } from '@/blocks/types';

const SECTION_BLOCKS = ['fa/header', 'fa/text', 'fa/buttons', 'fa/media', 'fa/list', 'fa/query', 'fa/numbers', 'fa/reviews'];

type VariationConfig = {
    template?: BlockTemplate;
};

const variations = sectionMetadata.faConfig.variations as unknown as Record<string, VariationConfig>;

export function getSectionTemplate(variant: string): BlockTemplate {
    const template = variations[variant]?.template ?? [];
    const filtered = wp.hooks.applyFilters(
        'frontendaBlocks.section.template',
        template,
        variant,
    );

    return Array.isArray(filtered) ? filtered as BlockTemplate : template;
}

export function getSectionAllowedBlocks(variant: string): string[] {
    const filtered = wp.hooks.applyFilters(
        'frontendaBlocks.section.allowedBlocks',
        [...SECTION_BLOCKS],
        variant,
    );

    return Array.isArray(filtered)
        ? [...new Set(filtered.filter((block): block is string => typeof block === 'string'))]
        : SECTION_BLOCKS;
}
