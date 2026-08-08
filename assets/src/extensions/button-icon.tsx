import { wp } from '@/editor/wp';
import type { MediaSelection } from '@/editor/types';

const { createElement, Fragment } = wp.element;
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;
const { InspectorControls, MediaUpload, MediaUploadCheck } = wp.blockEditor;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const { Button, PanelBody, SelectControl } = wp.components;
const { __ } = wp.i18n;

type ButtonIconAttributes = {
    faIconId?: number;
    faIconPosition?: 'left' | 'right';
};

type BlockEditProps = {
    name: string;
    attributes: ButtonIconAttributes;
    setAttributes: (attributes: Partial<ButtonIconAttributes>) => void;
};

type MediaEntity = {
    source_url?: string;
    alt_text?: string;
    mime_type?: string;
};

addFilter(
    'blocks.registerBlockType',
    'frontenda-blocks/button-icon-attributes',
    (settings: Record<string, unknown>, name: string) => {
        if (name !== 'core/button') {
            return settings;
        }

        return {
            ...settings,
            attributes: {
                ...(settings.attributes as Record<string, unknown> ?? {}),
                faIconId: { type: 'number', default: 0 },
                faIconPosition: { type: 'string', enum: ['left', 'right'], default: 'left' },
            },
        };
    },
);

const blockStoreDispatch = wp.data.dispatch(wp.blocks.store) as unknown as {
    reapplyBlockTypeFilters?: () => void;
};
blockStoreDispatch.reapplyBlockTypeFilters?.();

const withButtonIconControls = createHigherOrderComponent(
    (BlockEdit: (props: BlockEditProps) => JSX.Element) => (props: BlockEditProps) => {
        const iconId = Number(props.attributes.faIconId ?? 0);
        const icon = useSelect((select) => {
            if (props.name !== 'core/button' || iconId === 0) {
                return null;
            }

            return select(store).getMedia(iconId) as MediaEntity | null;
        }, [props.name, iconId]);

        if (props.name !== 'core/button') {
            return <BlockEdit {...props} />;
        }

        return <>
            <BlockEdit {...props} />
            <InspectorControls>
                <PanelBody title={__('Button icon', 'frontenda-blocks')} initialOpen={false}>
                    <div className="grid gap-3">
                        {iconId > 0 && icon?.source_url ? <img
                            src={icon.source_url}
                            alt={icon.alt_text ?? ''}
                            className="size-12 object-contain"
                        /> : null}

                        <MediaUploadCheck>
                            <MediaUpload
                                allowedTypes={['image/svg+xml']}
                                value={iconId}
                                onSelect={(media: MediaSelection) => {
                                    const mimeType = media.mime || media.mime_type;
                                    if (mimeType === 'image/svg+xml' || media.subtype === 'svg+xml') {
                                        props.setAttributes({ faIconId: media.id });
                                    }
                                }}
                                render={({ open }: { open: () => void }) => <Button variant="secondary" onClick={open}>
                                    {iconId
                                        ? __('Replace icon', 'frontenda-blocks')
                                        : __('Select icon', 'frontenda-blocks')}
                                </Button>}
                            />
                        </MediaUploadCheck>

                        {iconId > 0 ? <>
                            <SelectControl
                                label={__('Icon position', 'frontenda-blocks')}
                                value={props.attributes.faIconPosition ?? 'left'}
                                options={[
                                    { label: __('Left', 'frontenda-blocks'), value: 'left' },
                                    { label: __('Right', 'frontenda-blocks'), value: 'right' },
                                ]}
                                onChange={(position: string) => props.setAttributes({
                                    faIconPosition: position === 'right' ? 'right' : 'left',
                                })}
                            />
                            <Button
                                variant="link"
                                isDestructive
                                onClick={() => props.setAttributes({ faIconId: 0 })}
                            >
                                {__('Remove icon', 'frontenda-blocks')}
                            </Button>
                        </> : null}
                    </div>
                </PanelBody>
            </InspectorControls>
        </>;
    },
    'withButtonIconControls',
);

addFilter(
    'editor.BlockEdit',
    'frontenda-blocks/button-icon-controls',
    withButtonIconControls,
);
