import { wp } from '../wp';

const { __ } = wp.i18n;
const { createElement } = wp.element;
const { PanelBody, RangeControl, ToggleControl } = wp.components;

import type { SectionPanelProps } from '../types';

const DEFAULTS = {
    slidesPerView: 3,
    autoplay: false,
    loop: false,
};

export default function Swiper({ attributes, setAttributes }: SectionPanelProps) {
    const { swiper } = attributes;

    if (!swiper) return null;

    const { slidesPerView, autoplay, loop } = swiper;

    function update(next: Partial<typeof DEFAULTS>): void {
        setAttributes({ swiper: { ...swiper!, ...next } });
    }

    return (
        <PanelBody title={__('Swiper settings', 'frontenda-blocks')} initialOpen>
            <RangeControl
                label={__('Slides per view', 'frontenda-blocks')}
                value={slidesPerView ?? DEFAULTS.slidesPerView}
                onChange={(value: number | undefined) => update({ slidesPerView: value ?? DEFAULTS.slidesPerView })}
                min={1}
                max={6}
                step={0.1}
                allowReset={false}
            />
            <ToggleControl
                label={__('Autoplay', 'frontenda-blocks')}
                checked={autoplay ?? DEFAULTS.autoplay}
                onChange={(value: boolean) => update({ autoplay: value })}
            />
            <ToggleControl
                label={__('Loop', 'frontenda-blocks')}
                checked={loop ?? DEFAULTS.loop}
                onChange={(value: boolean) => update({ loop: value })}
            />
        </PanelBody>
    );
}
