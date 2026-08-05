import type { BlockConfiguration } from '@wordpress/blocks';
import type { BlockTemplate } from '@/blocks/types';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

export function registerHeadingWrapper(
    metadata: BlockConfiguration,
    template: BlockTemplate,
): void {
    registerBlockType(metadata, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks
                allowedBlocks={['core/heading', 'core/paragraph']}
                template={template}
            />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}
