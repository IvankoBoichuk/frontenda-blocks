import type { BlockConfiguration } from '@wordpress/blocks';
import subtitleMetadata from '../../../../blocks/subtitle/block.json';
import { registerHeadingWrapper } from '@/blocks/heading/register';
import { wp } from '@/editor/wp';

const { __ } = wp.i18n;

export function registerSubtitleBlock(): void {
    registerHeadingWrapper(
        subtitleMetadata as BlockConfiguration,
        [['core/paragraph', { placeholder: __('Subtitle', 'frontenda-blocks') }]],
    );
}
