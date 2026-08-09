import type { BlockConfiguration } from '@wordpress/blocks';
import numbersMetadata from '../../../../blocks/numbers/block.json';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

export function registerNumbersBlock(): void {
    registerBlockType(numbersMetadata as BlockConfiguration, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks allowedBlocks={['fa/number']} />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}
