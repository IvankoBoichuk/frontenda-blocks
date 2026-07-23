import { wp } from '../wp';

const { __ } = wp.i18n;

import type {
    SectionAttributes,
    HeadingElement,
} from '../types';

const { createElement } = wp.element;
const {
    PanelBody,
    __experimentalToggleGroupControl: ToggleGroupControl,
    __experimentalToggleGroupControlOption: ToggleGroupControlOption,
} = wp.components;

type TitlePanelProps = {
    attributes: {
        ttl?: HeadingElement;
    };
    setAttributes: (attributes: { ttl?: HeadingElement }) => void;
};

export default function Title({
    attributes,
    setAttributes,
}: TitlePanelProps) {

    const { ttl } = attributes;
    if (!ttl) return null;

    return (
        <PanelBody title={__('Title', 'frontenda-blocks')} initialOpen={false}>
            <ToggleGroupControl
                label={__('Heading Level', 'frontenda-blocks')}
                value={ttl.level}
                isBlock
                onChange={(nextValue: string | number | undefined) => {
                    setAttributes({
                        ttl: {
                            ...ttl,
                            level: nextValue as NonNullable<SectionAttributes['ttl']>['level'],
                        }
                    });
                }}
            >
                {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => (
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
