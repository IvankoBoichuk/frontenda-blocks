import type { BlockConfiguration } from '@wordpress/blocks';
import numberMetadata from '../../../../blocks/number/block.json';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

export function registerNumberBlock(): void {
    registerBlockType(numberMetadata as BlockConfiguration, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks allowedBlocks={['fa/title', 'core/image', 'fa/text']} />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}
