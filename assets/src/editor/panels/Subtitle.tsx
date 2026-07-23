import { wp } from '../wp';

const { __ } = wp.i18n;

import type {
    SectionAttributes,
    SectionPanelProps,
} from '../types';

const { createElement } = wp.element;
const {
    PanelBody,
    __experimentalToggleGroupControl: ToggleGroupControl,
    __experimentalToggleGroupControlOption: ToggleGroupControlOption,
} = wp.components;

export default function Subtitle({
    attributes,
    setAttributes,
}: SectionPanelProps) {

    const { subttl } = attributes;
    if (!subttl) return null;

    return (
        <PanelBody title={__('Subtitle', 'frontenda-blocks')} initialOpen={false}>
            <ToggleGroupControl
                label={__('Heading Level', 'frontenda-blocks')}
                value={subttl.level}
                isBlock
                onChange={(nextValue: string | number | undefined) => {
                    setAttributes({
                        subttl: {
                            ...subttl,
                            level: nextValue as NonNullable<SectionAttributes['subttl']>['level'],
                        }
                    });
                }}
            >
                {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p'].map((level) => (
                    <ToggleGroupControlOption
                        key={level}
                        value={level}
                        label={level.toUpperCase()}
                    />
                ))}
            </ToggleGroupControl>
        </PanelBody>
    );
}