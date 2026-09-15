import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import sectionMetadata from '../../../../blocks/section/block.json';
import { getSectionAllowedBlocks, getSectionTemplate } from './config';
import { wp } from '@/editor/wp';
import type { SectionAttributes } from '@/editor/types';
import SectionSettings from '@/editor/panels/SectionSettings';

const { createElement, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, InspectorControls, useBlockProps } = wp.blockEditor;

type SectionBlockAttributes = Pick<
    SectionAttributes,
    'variant' | 'layout' | 'layouts' | 'cardLayouts' | 'nickname' | 'anchor'
>;

export function registerSectionBlock(): void {
    registerBlockType<SectionBlockAttributes>(
        sectionMetadata as BlockConfiguration<SectionBlockAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<SectionBlockAttributes>) => {
                const blockProps = useBlockProps();
                return <>
                    <InspectorControls>
                        <SectionSettings attributes={attributes} setAttributes={setAttributes} />
                    </InspectorControls>
                    <div {...blockProps}>
                        <InnerBlocks
                            allowedBlocks={getSectionAllowedBlocks(attributes.variant)}
                            template={getSectionTemplate(attributes.variant)}
                            templateLock={false}
                        />
                    </div>
                </>;
            },
            save: () => <InnerBlocks.Content />,
        },
    );
}
