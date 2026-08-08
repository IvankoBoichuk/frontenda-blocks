import { wp } from '@/editor/wp';

const { createElement, Fragment } = wp.element;
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

type ButtonStyleAttributes = {
    faVariant?: 'fill' | 'outline';
    faSize?: 'sm' | 'md' | 'lg';
};

type BlockEditProps = {
    name: string;
    attributes: ButtonStyleAttributes;
    setAttributes: (attributes: Partial<ButtonStyleAttributes>) => void;
};

addFilter(
    'blocks.registerBlockType',
    'frontenda-blocks/button-style-attributes',
    (settings: Record<string, unknown>, name: string) => {
        if (name !== 'core/button') {
            return settings;
        }

        return {
            ...settings,
            attributes: {
                ...(settings.attributes as Record<string, unknown> ?? {}),
                faVariant: { type: 'string', enum: ['fill', 'outline'], default: 'fill' },
                faSize: { type: 'string', enum: ['sm', 'md', 'lg'], default: 'md' },
            },
        };
    },
);

const blockStoreDispatch = wp.data.dispatch(wp.blocks.store) as unknown as {
    reapplyBlockTypeFilters?: () => void;
};
blockStoreDispatch.reapplyBlockTypeFilters?.();

const withButtonStyleControls = createHigherOrderComponent(
    (BlockEdit: (props: BlockEditProps) => JSX.Element) => (props: BlockEditProps) => {
        if (props.name !== 'core/button') {
            return <BlockEdit {...props} />;
        }

        return <>
            <BlockEdit {...props} />
            <InspectorControls>
                <PanelBody title={__('Button style', 'frontenda-blocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Variant', 'frontenda-blocks')}
                        value={props.attributes.faVariant ?? 'fill'}
                        options={[
                            { label: __('Fill', 'frontenda-blocks'), value: 'fill' },
                            { label: __('Outline', 'frontenda-blocks'), value: 'outline' },
                        ]}
                        onChange={(variant: string) => props.setAttributes({
                            faVariant: variant === 'outline' ? 'outline' : 'fill',
                        })}
                    />
                    <SelectControl
                        label={__('Size', 'frontenda-blocks')}
                        value={props.attributes.faSize ?? 'md'}
                        options={[
                            { label: __('Small', 'frontenda-blocks'), value: 'sm' },
                            { label: __('Medium', 'frontenda-blocks'), value: 'md' },
                            { label: __('Large', 'frontenda-blocks'), value: 'lg' },
                        ]}
                        onChange={(size: string) => props.setAttributes({
                            faSize: size === 'sm' || size === 'lg' ? size : 'md',
                        })}
                    />
                </PanelBody>
            </InspectorControls>
        </>;
    },
    'withButtonStyleControls',
);

addFilter(
    'editor.BlockEdit',
    'frontenda-blocks/button-style-controls',
    withButtonStyleControls,
);
