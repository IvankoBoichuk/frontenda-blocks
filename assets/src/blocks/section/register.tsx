import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import sectionMetadata from '../../../../blocks/section/block.json';
import { getSectionAllowedBlocks, getSectionTemplate } from './config';
import { wp } from '@/editor/wp';
import type { SectionAttributes } from '@/editor/types';

const { createElement, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, InspectorControls, useBlockProps } = wp.blockEditor;
const { PanelBody, SelectControl, TextControl } = wp.components;
const { __ } = wp.i18n;

type SectionBlockAttributes = Pick<
    SectionAttributes,
    'variant' | 'layout' | 'layouts' | 'nickname' | 'anchor'
>;

export function registerSectionBlock(): void {
    registerBlockType<SectionBlockAttributes>(
        sectionMetadata as BlockConfiguration<SectionBlockAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<SectionBlockAttributes>) => {
                const blockProps = useBlockProps();
                const layouts = attributes.layouts ?? [];

                return <>
                    <InspectorControls>
                        <PanelBody title={__('Section settings', 'frontenda-blocks')} initialOpen>
                            <TextControl
                                label={__('Nickname', 'frontenda-blocks')}
                                value={attributes.nickname ?? ''}
                                onChange={(nickname: string) => setAttributes({ nickname })}
                            />
                            {layouts.length > 0 && <SelectControl
                                __next40pxDefaultSize
                                label={__('Layout', 'frontenda-blocks')}
                                value={attributes.layout ?? layouts[0]?.value ?? ''}
                                options={layouts}
                                onChange={(layout: string) => setAttributes({ layout })}
                            />}
                        </PanelBody>
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
