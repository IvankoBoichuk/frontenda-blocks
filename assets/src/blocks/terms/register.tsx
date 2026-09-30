import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import termsMetadata from '../../../../blocks/terms/block.json';
import TermsEditor from '@/editor/panels/Terms';
import type { TermsAttributes } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;

export function registerTermsBlock(): void {
    registerBlockType<TermsAttributes>(
        termsMetadata as BlockConfiguration<TermsAttributes>,
        {
            edit: ({ attributes, setAttributes }: BlockEditProps<TermsAttributes>) => (
                <div {...useBlockProps()}>
                    <TermsEditor terms={attributes.terms} setAttributes={setAttributes} />
                </div>
            ),
            save: () => null,
        },
    );
}
