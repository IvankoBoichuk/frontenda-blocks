import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import listMetadata from '../../../../blocks/list/block.json';
import ListEditor, { ListSettings } from '@/editor/panels/List';
import type { SectionAttributes } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { InspectorControls, useBlockProps } = wp.blockEditor;

type ListBlockAttributes = Pick<SectionAttributes, 'list'>;

export function registerListBlock(): void {
    registerBlockType<ListBlockAttributes>(
        listMetadata as BlockConfiguration<ListBlockAttributes>,
        {
            edit: ({ attributes, context, setAttributes }: BlockEditProps<ListBlockAttributes>) => <>
                <InspectorControls>
                    <ListSettings
                        list={attributes.list}
                        cardLayouts={context['fa/cardLayouts'] as SectionAttributes['cardLayouts']}
                        setAttributes={setAttributes}
                    />
                </InspectorControls>
                <div {...useBlockProps()}>
                    <ListEditor list={attributes.list} setAttributes={setAttributes} />
                </div>
            </>,
            save: () => null,
        },
    );
}
