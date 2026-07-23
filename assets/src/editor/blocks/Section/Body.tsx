import { wp } from '@/editor/wp';

import { Media, Subtitle, Text, Title } from '@/editor/elements';
import List from '../../panels/List';

import type { EditorBlockNode, SectionEditProps } from '../../types';

type InnerBlocksTemplate = Array<[string, Record<string, never>]>;

const { createElement, useEffect } = wp.element;
const { useSelect, useDispatch } = wp.data;
const { store: blockEditorStore } = wp.blockEditor;
const { createBlock } = wp.blocks;

const { __ } = wp.i18n;

export default function Body({
    clientId,
    setAttributes,
    attributes
}: SectionEditProps) {

    const {
        allowedElements = [],
        ttl,
        subttl,
        // text,
        // buttons,
        media,
        list,
        layouts,
        variant,
    } = attributes; // default values see in block.json

    const shouldShowButtons = allowedElements.includes('buttons');

    const innerBlocks = useSelect(
        (select) => {
            return (select(blockEditorStore).getBlocks(clientId) as EditorBlockNode[]) ?? [];
        },
        [clientId]
    );
    const { insertBlock, removeBlocks } = useDispatch('core/block-editor');
    const hasButtonsBlock = innerBlocks.some((block) => block.name === 'core/buttons');
    const innerBlocksTemplate: InnerBlocksTemplate | undefined = shouldShowButtons && !hasButtonsBlock
        ? [['core/buttons', {}]]
        : undefined;

    useEffect(() => {
        if (!shouldShowButtons || hasButtonsBlock) {
            return;
        }

        insertBlock(createBlock('core/buttons'), innerBlocks.length, clientId);
    }, [shouldShowButtons, clientId, hasButtonsBlock, innerBlocks.length, insertBlock]);

    useEffect(() => {
        if (shouldShowButtons || !hasButtonsBlock) {
            return;
        }

        removeBlocks(
            innerBlocks
                .filter((block) => block.name === 'core/buttons')
                .map((block) => block.clientId)
        );
    }, [shouldShowButtons, hasButtonsBlock, innerBlocks, removeBlocks]);
    // showSplitLayout ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] lg:items-start' : 'grid gap-8'

    if (allowedElements.length === 0) {
        return <div className="type-x-small text-neutral-secondary rounded-2xl border border-dashed border-[#D9DDE7] p-6">
            {__('No elements enabled. Please select allowed elements in the block settings.', 'frontenda-blocks')}
        </div>;
    }

    return (
        <div className="grid gap-8 rounded-2xl border border-dashed border-[#D9DDE7] p-6">
            <div className="flex flex-col gap-5">
                {allowedElements.includes('subttl') && (
                    <Subtitle
                        value={subttl}
                        onChange={(value) => setAttributes({ subttl: value })}
                    />
                )}

                {allowedElements.includes('ttl') && (
                    <Title
                        value={ttl}
                        onChange={(value) => setAttributes({ ttl: value })}
                    />
                )}

                {(allowedElements.includes('text') || shouldShowButtons) && <Text
                    template={innerBlocksTemplate}
                    withButtons={shouldShowButtons}
                />}

                {allowedElements.includes('media') && <Media media={media} />}

                {allowedElements.includes('list') && (
                    <List
                        list={list}
                        layouts={layouts}
                        variant={variant}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                )}
            </div>
        </div>
    );
}
