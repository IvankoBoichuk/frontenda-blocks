import type { BlockConfiguration } from '@wordpress/blocks';
import buttonsMetadata from '../../../../blocks/buttons/block.json';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, useBlockProps } = wp.blockEditor;

export function registerButtonsBlock(): void {
    registerBlockType(buttonsMetadata as BlockConfiguration, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks
                allowedBlocks={['core/buttons']}
                template={[[
                    'core/buttons',
                    {},
                    [['core/button', {}]],
                ]]}
                templateLock={false}
            />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}
