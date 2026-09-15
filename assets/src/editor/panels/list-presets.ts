import metadata from '../../../../blocks/section/block.json';
import type { ListItem, ListItemFieldKey } from '../types';

export type ListItemFields = {
	subttl: boolean;
	ttl: boolean;
	text: boolean;
	image: boolean;
	icon: boolean;
	link: boolean;
	post: boolean;
};

type SectionBlockConfig = {
	faConfig?: {
		listItemFields?: {
			default?: ListItemFieldKey[];
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
const NUMBERED_STEP_PRESET: ListItemFieldKey[] = ['ttl', 'text'];

export const EDITABLE_LIST_ITEM_FIELDS: ListItemFieldKey[] = ['subttl', 'ttl', 'text', 'image', 'icon'];

export function getListItemFieldKeys(layout?: string | null, fields?: ListItemFieldKey[]): ListItemFieldKey[] {
	if (fields) {
		return fields;
	}

	return layout === 'numbered-step'
		? NUMBERED_STEP_PRESET
		: Object.entries(DEFAULT_PRESET)
			.filter(([, enabled]) => enabled)
			.map(([field]) => field as ListItemFieldKey);
}

export function getListItemFields(layout?: string | null, fields?: ListItemFieldKey[]): ListItemFields {
	return fieldKeysToMap(getListItemFieldKeys(layout, fields));
}

export function sanitizeListItem(item: ListItem): ListItem {
	return {
		ttl: item.ttl?.text ? item.ttl : null,
		subttl: item.subttl?.text ? item.subttl : null,
		text: item.text || null,
		image: item.image?.id ? item.image : null,
		icon: item.icon?.id ? item.icon : null,
		link: item.link?.url || item.link?.text ? item.link : null,
		post: item.post ?? null,
		meta: item.meta && Object.keys(item.meta).length ? item.meta : null,
	};
}
