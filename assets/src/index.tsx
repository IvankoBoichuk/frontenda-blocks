import type { BlockConfiguration, BlockEditProps } from '@wordpress/blocks';
import sectionMetadata from '../../blocks/section/block.json';
import headerMetadata from '../../blocks/header/block.json';
import titleMetadata from '../../blocks/title/block.json';
import subtitleMetadata from '../../blocks/subtitle/block.json';
import textMetadata from '../../blocks/text/block.json';
import buttonsMetadata from '../../blocks/buttons/block.json';
import mediaMetadata from '../../blocks/media/block.json';
import listMetadata from '../../blocks/list/block.json';
import { wp } from '@/editor/wp';
import MediaPreview from '@/editor/elements/Media';
import MediaPanel from '@/editor/panels/Media';
import ListEditor, { ListSettings } from '@/editor/panels/List';
import type { SectionAttributes, SectionMedia } from '@/editor/types';

const { createElement, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { InnerBlocks, InspectorControls, useBlockProps } = wp.blockEditor;
const { PanelBody, SelectControl, TextControl } = wp.components;
const { __ } = wp.i18n;

const SECTION_BLOCKS = ['fa/header', 'fa/text', 'fa/buttons', 'fa/media', 'fa/list'];
const TEXT_BLOCKS = ['core/paragraph', 'core/heading', 'core/list', 'core/quote', 'core/separator'];
type TemplateItem = [string, Record<string, unknown>, Template?];
type Template = TemplateItem[];

type SectionAttrs = Pick<SectionAttributes, 'variant' | 'layout' | 'layouts' | 'nickname' | 'anchor'>;
type MediaAttrs = { media?: SectionMedia };
type ListAttrs = Pick<SectionAttributes, 'list'>;

function sectionTemplate(variant: string): Template {
    const config = (sectionMetadata.faConfig.variations as Record<string, { defaultElements?: string[] }>)[variant];
    const elements = config?.defaultElements ?? [];
    const template: Template = [];

    if (elements.includes('subttl') || elements.includes('ttl')) template.push(['fa/header', {}]);
    if (elements.includes('text')) template.push(['fa/text', {}]);
    if (elements.includes('buttons')) template.push(['fa/buttons', {}]);
    if (elements.includes('media')) template.push(['fa/media', {}]);
    if (elements.includes('list')) template.push(['fa/list', {}]);

    const filteredTemplate = wp.hooks.applyFilters(
        'frontendaBlocks.section.template',
        template,
        variant,
    );

    return Array.isArray(filteredTemplate) ? filteredTemplate as Template : template;
}

function sectionAllowedBlocks(variant: string): string[] {
    const filteredBlocks = wp.hooks.applyFilters(
        'frontendaBlocks.section.allowedBlocks',
        [...SECTION_BLOCKS],
        variant,
    );

    return Array.isArray(filteredBlocks)
        ? [...new Set(filteredBlocks.filter((block): block is string => typeof block === 'string'))]
        : SECTION_BLOCKS;
}

registerBlockType<SectionAttrs>(sectionMetadata as BlockConfiguration<SectionAttrs>, {
    edit: ({ attributes, setAttributes }: BlockEditProps<SectionAttrs>) => {
        const blockProps = useBlockProps();
        const layouts = attributes.layouts ?? [];

        return <>
            <InspectorControls>
                <PanelBody title={__('Section settings', 'frontenda-blocks')} initialOpen>
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
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <InnerBlocks
                    allowedBlocks={sectionAllowedBlocks(attributes.variant)}
                    template={sectionTemplate(attributes.variant)}
                    templateLock={false}
                />
            </div>
        </>;
    },
    save: () => <InnerBlocks.Content />,
});

registerBlockType(headerMetadata as BlockConfiguration, {
    edit: () => <div {...useBlockProps({ className: 'grid gap-5' })}>
        <InnerBlocks
            allowedBlocks={['fa/subtitle', 'fa/title']}
            template={[
                ['fa/subtitle', {}],
                ['fa/title', {}],
            ]}
        />
    </div>,
    save: () => <InnerBlocks.Content />,
});

function registerHeadingWrapper(
    metadata: BlockConfiguration,
    template: Template,
) {
    registerBlockType(metadata, {
        edit: () => <div {...useBlockProps()}>
            <InnerBlocks
                allowedBlocks={['core/heading', 'core/paragraph']}
                template={template}
            />
        </div>,
        save: () => <InnerBlocks.Content />,
    });
}

registerHeadingWrapper(
    subtitleMetadata as BlockConfiguration,
    [['core/paragraph', { placeholder: __('Subtitle', 'frontenda-blocks') }]],
);

registerHeadingWrapper(
    titleMetadata as BlockConfiguration,
    [['core/heading', { level: 2, placeholder: __('Title', 'frontenda-blocks') }]],
);

registerBlockType(textMetadata as BlockConfiguration, {
    edit: () => <div {...useBlockProps()}>
        <InnerBlocks allowedBlocks={TEXT_BLOCKS} template={[['core/paragraph', {}]]} />
    </div>,
    save: () => <InnerBlocks.Content />,
});

registerBlockType(buttonsMetadata as BlockConfiguration, {
    edit: () => <div {...useBlockProps()}>
        <InnerBlocks
            allowedBlocks={['core/buttons']}
            template={[[
                'core/buttons',
                {},
                [['core/button', {}]],
            ]]}
            templateLock={false}
        />
    </div>,
    save: () => <InnerBlocks.Content />,
});

registerBlockType<MediaAttrs>(mediaMetadata as BlockConfiguration<MediaAttrs>, {
    edit: ({ attributes, setAttributes }: BlockEditProps<MediaAttrs>) => <>
        <InspectorControls>
            <MediaPanel attributes={attributes} setAttributes={setAttributes} />
        </InspectorControls>
        <div {...useBlockProps()}><MediaPreview media={attributes.media} /></div>
    </>,
    save: () => null,
});

registerBlockType<ListAttrs>(listMetadata as BlockConfiguration<ListAttrs>, {
    edit: (props: BlockEditProps<ListAttrs>) => {
        const { attributes, setAttributes, context } = props;
        const variant = typeof context['fa/variant'] === 'string' ? context['fa/variant'] : '';
        const layout = typeof context['fa/layout'] === 'string' ? context['fa/layout'] : '';
        const compatibleAttributes = { ...attributes, variant, layout } as SectionAttributes;

        return <>
            <InspectorControls>
                <ListSettings
                    list={attributes.list}
                    attributes={compatibleAttributes}
                    setAttributes={setAttributes}
                />
            </InspectorControls>
            <div {...useBlockProps()}>
                <ListEditor
                    list={attributes.list}
                    variant={variant}
                    attributes={compatibleAttributes}
                    setAttributes={setAttributes}
                />
            </div>
        </>;
    },
    save: () => null,
});
