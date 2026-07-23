import { wp } from '@/editor/wp';
import type { HeadingElement } from '@/editor/types';

const { createElement } = wp.element;
const { RichText } = wp.blockEditor;
const { __ } = wp.i18n;

type TitleProps = {
    value?: HeadingElement;
    className?: string;
    placeholder?: string;
    defaultLevel?: HeadingElement['level'];
    onChange: (value: HeadingElement) => void;
};

export default function Title({
    value,
    className = 'type-no-name-1 lg:type-large m-0!',
    placeholder = __('Title', 'frontenda-blocks'),
    defaultLevel = 'h2',
    onChange,
}: TitleProps) {
    return (
        <RichText
            tagName="div"
            className={className}
            value={value?.text ?? ''}
            allowedFormats={['core/bold', 'core/italic', 'core/link']}
            placeholder={placeholder}
            onChange={(text: string) => {
                onChange({ ...(value ?? { level: defaultLevel }), text });
            }}
        />
    );
}
