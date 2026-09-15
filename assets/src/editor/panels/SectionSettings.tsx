import type { LayoutOption } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement } = wp.element;
const { PanelBody, SelectControl, TextControl } = wp.components;
const { __ } = wp.i18n;

export type SectionSettingsAttributes = {
    layout?: string;
    layouts?: LayoutOption[];
    nickname?: string;
};

type SectionSettingsProps = {
    attributes: SectionSettingsAttributes;
    setAttributes: (attributes: Partial<SectionSettingsAttributes>) => void;
};

export default function SectionSettings({ attributes, setAttributes }: SectionSettingsProps) {
    const layouts = attributes.layouts ?? [];

    return <PanelBody title={__('Section settings', 'frontenda-blocks')} initialOpen>
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
    </PanelBody>;
}
