import { wp } from '../wp';
import type { LayoutOption } from '../types';

const { createElement } = wp.element;
const { SelectControl } = wp.components;
const { __ } = wp.i18n;

type LayoutSelectorProps = {
	label?: string;
	value?: string | null;
	layouts: LayoutOption[];
	onChange: (value: string | null) => void;
};

export default function LayoutSelector({
	label = __('Layout', 'frontenda-blocks'),
	value,
	layouts,
	onChange,
}: LayoutSelectorProps) {
	if (!layouts.length) {
		return null;
	}

	return (
		<SelectControl
			__next40pxDefaultSize
			label={label}
			value={value ?? ''}
			options={[
				...layouts,
			]}
			onChange={(nextValue: string) => {
				onChange(nextValue || null);
			}}
		/>
	);
}
