import type { BlockConfiguration } from '@wordpress/blocks';
import textMetadata from '../../../../blocks/text/block.json';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

const TEXT_BLOCKS = ['core/paragraph', 'core/heading', 'core/list', 'core/quote', 'core/separator'];

export function registerTextBlock(): void {
    registerBlockType(textMetadata as BlockConfiguration, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks allowedBlocks={TEXT_BLOCKS} template={[['core/paragraph', {}]]} />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}
