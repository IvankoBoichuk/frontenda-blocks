import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import mediaMetadata from '../../../../blocks/media/block.json';
import MediaPreview from '@/editor/elements/Media';
import MediaPanel from '@/editor/panels/Media';
import type { SectionMedia } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { InspectorControls, useBlockProps } = wp.blockEditor;

type MediaBlockAttributes = {
    media?: SectionMedia;
};

export function registerMediaBlock(): void {
    registerBlockType<MediaBlockAttributes>(
        mediaMetadata as BlockConfiguration<MediaBlockAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<MediaBlockAttributes>) => <>
                <InspectorControls>
                    <MediaPanel attributes={attributes} setAttributes={setAttributes} />
                </InspectorControls>
                <div {...useBlockProps()}>
                    <MediaPreview media={attributes.media} />
                </div>
            </>,
            save: () => null,
        },
    );
}
