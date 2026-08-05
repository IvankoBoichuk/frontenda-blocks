import type { BlockConfiguration } from '@wordpress/blocks';
import headerMetadata from '../../../../blocks/header/block.json';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

export function registerHeaderBlock(): void {
    registerBlockType(headerMetadata as BlockConfiguration, {
        edit: () => <div {...useBlockProps({ className: 'grid gap-5' })}>
            <InnerBlocks
                allowedBlocks={['fa/subtitle', 'fa/title']}
                template={[
                    ['fa/subtitle', {}],
                    ['fa/title', {}],
                ]}
            />
        </div>,
        save: () => <InnerBlocks.Content />,
    });

}
