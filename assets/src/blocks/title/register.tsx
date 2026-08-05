import type { BlockConfiguration } from '@wordpress/blocks';
import titleMetadata from '../../../../blocks/title/block.json';
import { registerHeadingWrapper } from '@/blocks/heading/register';
import { wp } from '@/editor/wp';

const { __ } = wp.i18n;

export function registerTitleBlock(): void {
    registerHeadingWrapper(
        titleMetadata as BlockConfiguration,
        [['core/heading', { level: 2, placeholder: __('Title', 'frontenda-blocks') }]],
    );
}
