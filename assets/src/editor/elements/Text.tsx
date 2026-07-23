import { wp } from '@/editor/wp';

type InnerBlocksTemplate = Array<[string, Record<string, unknown>]>;

const { createElement } = wp.element;
const { InnerBlocks } = wp.blockEditor;

const TEXT_ALLOWED_BLOCKS = [
    'core/paragraph',
    'core/bold',
    'core/italic',
    'core/link',
    'core/separator',
    'core/list',
    'core/heading',
];

type TextProps = {
    allowedBlocks?: string[];
    template?: InnerBlocksTemplate;
    templateLock?: false | 'all' | 'insert' | 'contentOnly';
    withButtons?: boolean;
    renderAppender?: undefined | typeof InnerBlocks.DefaultBlockAppender;
};

export default function Text({
    allowedBlocks = TEXT_ALLOWED_BLOCKS,
    template,
    templateLock,
    withButtons = false,
    renderAppender,
}: TextProps) {
    return (
        <InnerBlocks
            allowedBlocks={[
                ...allowedBlocks,
                ...(withButtons ? ['core/buttons'] : []),
            ]}
            template={template}
            templateLock={templateLock}
            renderAppender={renderAppender}
        />
    );
}
