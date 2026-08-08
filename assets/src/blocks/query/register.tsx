import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import queryMetadata from '../../../../blocks/query/block.json';
import QueryEditor from '@/editor/panels/Query';
import type { QueryAttributes } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;

export function registerQueryBlock(): void {
    registerBlockType<QueryAttributes>(
        queryMetadata as BlockConfiguration<QueryAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<QueryAttributes>) => (
                <div {...useBlockProps()}>
                    <QueryEditor query={attributes.query} setAttributes={setAttributes} />
                </div>
            ),
            save: () => null,
        },
    );
}
