import { wp } from '@/editor/wp';
import ListItemEditor from '@/editor/components/ListItemEditor';

import {
	EDITABLE_LIST_ITEM_FIELDS,
	getListItemFieldKeys,
	getListItemFields,
	sanitizeListItem,
} from './list-presets';
import LayoutSelector from './LayoutSelector';

import type {
	LayoutOption,
	ListItem,
	ListItemFieldKey,
	MediaSelection,
	SectionAttributes,
} from '../types';
import { createEmptyListItem } from '../utils';

const { createElement, useState } = wp.element;
const { Button, CheckboxControl, PanelBody, TextControl } = wp.components;
const { __ } = wp.i18n;

type ListProps = {
	list?: SectionAttributes['list'];
	setAttributes: (attributes: Partial<SectionAttributes>) => void;
};

type ListSettingsProps = ListProps & {
	cardLayouts?: LayoutOption[];
};

export function ListSettings({
	list,
	cardLayouts = [],
	setAttributes,
}: ListSettingsProps) {
	const items = list?.items ?? [];
	const listTitle = list?.ttl?.text ?? '';
	const listTitleLevel = list?.ttl?.level ?? 'h3';
	const listLayout = list?.layout ?? '';
	const listFields = getListItemFieldKeys(list?.layout, list?.fields);
	const listTextIfEmpty = list?.textIfEmpty ?? '';
	const updateList = (nextList: SectionAttributes['list']) => {
		setAttributes({ list: nextList });
	};

	return (
		<PanelBody title={__('List settings', 'frontenda-blocks')} initialOpen={false}>
			<div className="grid gap-4">
				<TextControl
					__next40pxDefaultSize
					label={__('List title', 'frontenda-blocks')}
					value={listTitle}
						onChange={(value: string) => {
						updateList({
							layout: list?.layout ?? null,
							fields: list?.fields,
							textIfEmpty: list?.textIfEmpty ?? null,
							ttl: value ? { text: value, level: listTitleLevel } : null,
							items,
						});
					}}
				/>
				<LayoutSelector
					label={__('Card layout', 'frontenda-blocks')}
					value={listLayout}
					layouts={cardLayouts}
					onChange={(value: string | null) => {
						updateList({
							layout: value,
							fields: getListItemFieldKeys(value),
							textIfEmpty: list?.textIfEmpty ?? null,
							ttl: list?.ttl ?? null,
							items,
						});
					}}
				/>
				<div className="grid gap-2">
					<strong>{__('Card fields', 'frontenda-blocks')}</strong>
					{EDITABLE_LIST_ITEM_FIELDS.map((field) => {
						const labels: Record<ListItemFieldKey, string> = {
							subttl: __('Subtitle', 'frontenda-blocks'),
							ttl: __('Title', 'frontenda-blocks'),
							text: __('Text', 'frontenda-blocks'),
							image: __('Image', 'frontenda-blocks'),
							icon: __('Icon', 'frontenda-blocks'),
							link: __('Link', 'frontenda-blocks'),
							post: __('Post', 'frontenda-blocks'),
						};

						return <CheckboxControl
							key={field}
							label={labels[field]}
							checked={listFields.includes(field)}
							onChange={(checked: boolean) => updateList({
								layout: list?.layout ?? null,
								fields: checked
									? [...listFields, field]
									: listFields.filter((currentField) => currentField !== field),
								textIfEmpty: list?.textIfEmpty ?? null,
								ttl: list?.ttl ?? null,
								items,
							})}
						/>;
					})}
				</div>
				{items.length === 0 && (
					<TextControl
						__next40pxDefaultSize
						label={__('Text if empty', 'frontenda-blocks')}
						value={listTextIfEmpty}
						onChange={(value: string) => {
							updateList({
								layout: list?.layout ?? null,
								fields: list?.fields,
								textIfEmpty: value || null,
								ttl: list?.ttl ?? null,
								items,
							});
						}}
					/>
				)}
			</div>
		</PanelBody>
	);
}

export default function List({
	list,
	setAttributes,
}: ListProps) {
	const fields = getListItemFields(list?.layout, list?.fields);
	const [openLinkIndex, setOpenLinkIndex] = useState<number | null>(null);
	const items = list?.items ?? [];
	const updateList = (nextList: SectionAttributes['list']) => {
		setAttributes({ list: nextList });
	};
	const updateItems = (nextItems: ListItem[]) => {
		updateList({
			layout: list?.layout ?? null,
			fields: list?.fields,
			textIfEmpty: list?.textIfEmpty ?? null,
			ttl: list?.ttl ?? null,
			items: nextItems,
		});
	};

	const updateItem = (index: number, nextItem: ListItem) => {
		updateItems(items.map((item, itemIndex) => itemIndex === index ? sanitizeListItem(nextItem) : item));
	};

	const addItem = () => {
		updateItems([...(items || []), sanitizeListItem(createEmptyListItem())]);
	};

	const removeItem = (index: number) => {
		updateItems(items.filter((_, itemIndex) => itemIndex !== index));
	};

	const moveItem = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
			return;
		}

		const nextItems = [...items];
		const [item] = nextItems.splice(fromIndex, 1);

		if (!item) {
			return;
		}

		nextItems.splice(toIndex, 0, item);
		updateItems(nextItems);
	};

	const onSelectImage = (index: number, media: MediaSelection) => {
		const currentItem = items[index] || createEmptyListItem();
		const defaults = createEmptyListItem();

		updateItem(index, {
			...currentItem,
			image: {
				...defaults.image!,
				...currentItem.image,
				id: media.id || 0,
			},
		});
	};

	const onSelectIcon = (index: number, media: MediaSelection) => {
		const mimeType = media.mime || media.mime_type || media.subtype;

		if (mimeType && mimeType !== 'image/svg+xml' && mimeType !== 'svg+xml') {
			return;
		}

		const currentItem = items[index] || createEmptyListItem();

		updateItem(index, {
			...currentItem,
			icon: { id: media.id || 0 },
		});
	};

	const clearImage = (index: number) => {
		const currentItem = items[index] || createEmptyListItem();
		const defaults = createEmptyListItem();

		updateItem(index, {
			...currentItem,
			image: {
				...defaults.image!,
				...currentItem.image,
				id: 0,
			},
		});
	};

	const clearIcon = (index: number) => {
		const currentItem = items[index] || createEmptyListItem();

		updateItem(index, {
			...currentItem,
			icon: { id: 0 },
		});
	};

	return (
		<div className="grid gap-5">
			{items.length ? items.map((rawItem, index) => {
				const defaults = createEmptyListItem();
				const item: ListItem = {
					...defaults,
					...rawItem,
					ttl: rawItem.ttl ? { ...defaults.ttl!, ...rawItem.ttl } : defaults.ttl,
					subttl: rawItem.subttl ? { ...defaults.subttl!, ...rawItem.subttl } : defaults.subttl,
					image: rawItem.image ? { ...defaults.image!, ...rawItem.image } : defaults.image,
					icon: rawItem.icon ? { ...defaults.icon!, ...rawItem.icon } : defaults.icon,
					link: rawItem.link ? { ...defaults.link!, ...rawItem.link } : defaults.link,
				};
				return (
					<ListItemEditor
						key={`list-item-${index}`}
						item={item}
						index={index}
						itemCount={items.length}
						fields={fields}
						openLinkIndex={openLinkIndex}
						setOpenLinkIndex={setOpenLinkIndex}
						updateItem={updateItem}
						removeItem={removeItem}
						moveItem={moveItem}
						onSelectImage={onSelectImage}
						onSelectIcon={onSelectIcon}
						clearImage={clearImage}
						clearIcon={clearIcon}
					/>
				);
			}) : (
				<div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-4 py-8 text-center type-small text-neutral-500">
					{__('No list items yet.', 'frontenda-blocks')}
				</div>
			)}
			<div className="flex justify-end">
				<Button variant="primary" onClick={addItem}>{__('Add item', 'frontenda-blocks')}</Button>
			</div>
		</div>
	);
}
