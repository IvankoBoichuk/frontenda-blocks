import { wp } from '@/editor/wp';
import { ALLOWED_ELEMENTS, type AllowedElement, type SectionEditProps } from '../types';
import { getAvailableElements, getDefaultAttributesForElements } from '../utils';

const { createElement, useRef } = wp.element;
const {
    CheckboxControl,
    PanelBody,
    SelectControl,
    TextControl
} = wp.components;
const { __ } = wp.i18n;

export default function Settings({
    setAttributes,
    attributes,
}: Pick<SectionEditProps, 'setAttributes' | 'attributes'>) {
    const { allowedElements = [] } = attributes;
    const availableElements = getAvailableElements(
        attributes.variant,
        Object.keys(ALLOWED_ELEMENTS) as AllowedElement[]
    );
    const cachedValues = useRef<Record<string, unknown>>({});

    const toggleAllowedElement = (key: AllowedElement, isChecked: boolean) => {
        const defaultAttributes = getDefaultAttributesForElements(attributes.variant, [key]);
        const managedAttributeKeys = Object.keys(defaultAttributes);
        const nextAllowedElements = isChecked
            ? [...allowedElements, key]
            : allowedElements.filter((item) => item !== key);

        const extraAttrs: Partial<typeof attributes> = {};

        if (!isChecked && managedAttributeKeys.length) {
            for (const attributeKey of managedAttributeKeys) {
                const currentValue = attributes[attributeKey as keyof typeof attributes];
                if (currentValue != null) {
                    cachedValues.current[attributeKey] = currentValue;
                }
                (extraAttrs as Record<string, unknown>)[attributeKey] = null;
            }
        } else if (isChecked && managedAttributeKeys.length) {
            for (const attributeKey of managedAttributeKeys) {
                (extraAttrs as Record<string, unknown>)[attributeKey] = cachedValues.current[attributeKey] ?? defaultAttributes[attributeKey as keyof typeof defaultAttributes];
                delete cachedValues.current[attributeKey];
            }
        }

        setAttributes({
            allowedElements: nextAllowedElements,
            ...extraAttrs,
        });
    };

    return <PanelBody title={__('Block settings', 'frontenda-blocks')} initialOpen>
        <TextControl
            label={__('Nickname', 'frontenda-blocks')}
            value={attributes.nickname || ''}
            onChange={(value) => setAttributes({ nickname: value })}
        />
        {attributes.layouts && attributes.layouts.length > 0 &&
            <SelectControl
                __next40pxDefaultSize
                label={__('Layout', 'frontenda-blocks')}
                value={attributes.layout || ''}
                options={attributes.layouts.map((layout) => ({
                    label: layout.label,
                    value: layout.value,
                }))}
                onChange={(value) => {
                    setAttributes({ layout: value });
                }}
            />
        }
        <div className="grid grid-cols-2">
            {availableElements.map((key) => (
                <CheckboxControl
                    key={key}
                    label={ALLOWED_ELEMENTS[key]}
                    checked={allowedElements.includes(key)}
                    onChange={(isChecked: boolean) => toggleAllowedElement(key, isChecked)}
                />
            ))}
        </div>
    </PanelBody>;
}
