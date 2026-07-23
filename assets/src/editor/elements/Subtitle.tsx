import { wp } from '@/editor/wp';
import type { TextElement as TextElementValue } from '@/editor/types';

const { createElement } = wp.element;
const { RichText } = wp.blockEditor;
const { __ } = wp.i18n;

type SubtitleProps = {
    value?: TextElementValue;
    className?: string;
    placeholder?: string;
    defaultLevel?: TextElementValue['level'];
    onChange: (value: TextElementValue) => void;
};

export default function Subtitle({
    value,
    className = 'type-x-small text-neutral-secondary m-0!',
    placeholder = __('Subtitle', 'frontenda-blocks'),
    defaultLevel = 'span',
    onChange,
}: SubtitleProps) {
    return (
        <RichText
            tagName="div"
            className={className}
            value={value?.text ?? ''}
            allowedFormats={[]}
            placeholder={placeholder}
            onChange={(text: string) => {
                onChange({ ...(value ?? { level: defaultLevel }), text });
            }}
        />
    );
}
