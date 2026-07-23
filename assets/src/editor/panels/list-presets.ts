import metadata from '../../../../blocks/section/block.json';
import type { ListItem } from '../types';

export type ListItemFields = {
	subttl: boolean;
	ttl: boolean;
	text: boolean;
	image: boolean;
	icon: boolean;
	link: boolean;
	post: boolean;
};

type ListItemFieldKey = keyof ListItemFields;

type SectionBlockConfig = {
	faConfig?: {
		listItemFields?: {
			default?: ListItemFieldKey[];
			presets?: Record<string, ListItemFieldKey[]>;
		};
	};
};

const ALL_LIST_ITEM_FIELDS: ListItemFieldKey[] = ['subttl', 'ttl', 'text', 'image', 'icon', 'link', 'post'];
const listItemFieldsConfig = (metadata as SectionBlockConfig).faConfig?.listItemFields;
const fieldKeysToMap = (fields: ListItemFieldKey[]): ListItemFields => {
	const availableFields = new Set(fields);

	return ALL_LIST_ITEM_FIELDS.reduce<ListItemFields>((result, field) => ({
		...result,
		[field]: availableFields.has(field),
	}), {} as ListItemFields);
};
const DEFAULT_PRESET = fieldKeysToMap(listItemFieldsConfig?.default ?? ['subttl', 'ttl', 'text', 'image', 'icon']);
const LIST_ITEM_PRESETS = listItemFieldsConfig?.presets ?? {};

export function getListItemFields(variant: string, layout: string): ListItemFields {
	const preset = LIST_ITEM_PRESETS[`${variant}-${layout}`] ?? LIST_ITEM_PRESETS[variant];

	return preset ? fieldKeysToMap(preset) : DEFAULT_PRESET;
}

export function sanitizeListItem(item: ListItem, fields: ListItemFields): ListItem {
	return {
		ttl: fields.ttl && item.ttl?.text ? item.ttl : null,
		subttl: fields.subttl && item.subttl?.text ? item.subttl : null,
		text: fields.text && item.text ? item.text : null,
		image: fields.image && item.image?.id ? item.image : null,
		icon: fields.icon && item.icon?.id ? item.icon : null,
		link: fields.link && (item.link?.url || item.link?.text) ? item.link : null,
		post: item.post ?? null,
		meta: item.meta && Object.keys(item.meta).length ? item.meta : null,
	};
}
