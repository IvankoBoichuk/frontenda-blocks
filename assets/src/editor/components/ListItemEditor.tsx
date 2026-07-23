import { wp } from '@/editor/wp';

import type { ListItem, MediaSelection } from '../types';
import type { ListItemFields } from '../panels/list-presets';
import { getPostLabel } from '../utils';
import ListMediaPicker from './ListMediaPicker';

const { createElement } = wp.element;
const { RichText, URLPopover, URLInput } = wp.blockEditor;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const { Button, SelectControl, TextControl } = wp.components;
const { __ } = wp.i18n;

type SelectOption = {
	label: string;
	value: string;
};

function getPickerButtonClassName(isActive: boolean) {
	return [
		'rounded-full border px-4 py-2 transition-colors',
		isActive
			? 'border-main bg-main text-white hover:bg-main/90'
			: 'border-neutral-300 bg-white text-main hover:border-main/40 hover:bg-neutral-50',
	].join(' ');
}

function SelectedPostPreview({
	postId,
	onClear,
}: {
	postId: number | null;
	onClear: () => void;
}) {
	const { post, hasResolved } = useSelect((select) => {
		if (!postId) {
			return {
				post: null,
				hasResolved: true,
			};
		}

		const coreDataStore = select(store);

		return {
			post: coreDataStore.getEntityRecord('postType', 'person', postId),
			hasResolved: coreDataStore.hasFinishedResolution('getEntityRecord', ['postType', 'person', postId]),
		};
	}, [postId]);

	if (!postId) {
		return null;
	}

	return (
		<div className="grid gap-2 rounded-[1.25rem] bg-neutral-50 p-3">
			<div className="type-x-small font-medium uppercase tracking-[0.12em] text-neutral-500">{__('Post', 'frontenda-blocks')}</div>
			<div className="flex items-center gap-3">
				<div className="type-small text-main">
					{post
						? getPostLabel(post as Parameters<typeof getPostLabel>[0])
						: hasResolved
							? __('Post not found', 'frontenda-blocks')
							: __('Loading post...', 'frontenda-blocks')}
				</div>
				<Button variant="tertiary" onClick={onClear}>
					{__('Remove post', 'frontenda-blocks')}
				</Button>
			</div>
		</div>
	);
}

export default function ListItemEditor({
	item,
	index,
	itemCount,
	fields,
	personOptions,
	openLinkIndex,
	setOpenLinkIndex,
	updateItem,
	removeItem,
	moveItem,
	onSelectImage,
	onSelectIcon,
	clearImage,
	clearIcon,
}: {
	item: ListItem;
	index: number;
	itemCount: number;
	fields: ListItemFields;
	personOptions: SelectOption[];
	openLinkIndex: number | null;
	setOpenLinkIndex: (index: number | null) => void;
	updateItem: (index: number, item: ListItem) => void;
	removeItem: (index: number) => void;
	moveItem: (fromIndex: number, toIndex: number) => void;
	onSelectImage: (index: number, media: MediaSelection) => void;
	onSelectIcon: (index: number, media: MediaSelection) => void;
	clearImage: (index: number) => void;
	clearIcon: (index: number) => void;
}) {
	return (
		<div
			key={`list-item-${index}`}
			className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
		>
			<div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
				<div className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center rounded-full bg-main/8 text-xs font-semibold text-main">
						{index + 1}
					</div>
					<div className="">
						{fields.subttl && <RichText
							tagName="div"
							className="type-x-small text-neutral-500"
							value={item.subttl!.text}
							allowedFormats={[]}
							placeholder={__('Subtitle', 'frontenda-blocks')}
							onChange={(value: string) => {
								updateItem(index, {
									...item,
									subttl: {
										...item.subttl!,
										text: value,
									},
								});
							}}
						/>}

						{fields.ttl && <RichText
							tagName="div"
							className="type-accent text-main"
							value={item.ttl!.text}
							allowedFormats={[]}
							placeholder={__('Title', 'frontenda-blocks')}
							onChange={(value: string) => {
								updateItem(index, {
									...item,
									ttl: {
										...item.ttl!,
										text: value,
									},
								});
							}}
						/>}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="tertiary"
						disabled={index === 0}
						onClick={() => moveItem(index, index - 1)}
					>
						{__('Up', 'frontenda-blocks')}
					</Button>
					<Button
						variant="tertiary"
						disabled={index === itemCount - 1}
						onClick={() => moveItem(index, index + 1)}
					>
						{__('Down', 'frontenda-blocks')}
					</Button>
					<Button variant="secondary" isDestructive onClick={() => removeItem(index)}>
						{__('Remove', 'frontenda-blocks')}
					</Button>
				</div>
			</div>

			{fields.text && <RichText
				tagName="div"
				className="type-small text-main/80"
				value={item.text ?? ''}
				allowedFormats={['core/bold', 'core/italic', 'core/link']}
				placeholder={__('Text', 'frontenda-blocks')}
				onChange={(value: string) => {
					updateItem(index, {
						...item,
						text: value,
					});
				}}
			/>}

			{fields.link && (
				<div className="grid gap-2 rounded-[1.25rem] bg-neutral-50 p-3">
					<div className="type-x-small font-medium uppercase tracking-[0.12em] text-neutral-500">{__('Link', 'frontenda-blocks')}</div>
					<div className="relative">
						<Button
							variant="tertiary"
							className={getPickerButtonClassName(Boolean(item.link?.url))}
							onClick={() => setOpenLinkIndex(openLinkIndex === index ? null : index)}
						>
							{item.link?.text || item.link?.url || __('Add link', 'frontenda-blocks')}
						</Button>
						{openLinkIndex === index && (
							<URLPopover onClose={() => setOpenLinkIndex(null)}>
								<div className="grid gap-3 min-w-80 p-1">
									<URLInput
										value={item.link?.url ?? ''}
										onChange={(url: string) => {
											updateItem(index, {
												...item,
												link: {
													url,
													text: item.link?.text ?? '',
												},
											});
										}}
									/>
									<TextControl
										__next40pxDefaultSize
										label={__('Link text', 'frontenda-blocks')}
										value={item.link?.text ?? ''}
										onChange={(text: string) => {
											updateItem(index, {
												...item,
												link: {
													url: item.link?.url ?? '',
													text,
												},
											});
										}}
									/>
								</div>
							</URLPopover>
						)}
					</div>
				</div>
			)}

			{(fields.image || fields.icon) && (
				<div className="grid gap-3 rounded-[1.25rem] bg-neutral-50 p-3">
					<div className="type-x-small font-medium uppercase tracking-[0.12em] text-neutral-500">{__('Assets', 'frontenda-blocks')}</div>
					<div className="flex flex-wrap items-center gap-3">
						{fields.image && (
							<ListMediaPicker
								value={item.image?.id}
								label={__('Image selected', 'frontenda-blocks')}
								selectLabel={__('Select image', 'frontenda-blocks')}
								replaceLabel={__('Replace image', 'frontenda-blocks')}
								allowedTypes={['image']}
								onSelect={(media: MediaSelection) => onSelectImage(index, media)}
								onClear={() => clearImage(index)}
							/>
						)}

						{fields.icon && (
							<ListMediaPicker
								value={item.icon?.id}
								label={__('Icon selected', 'frontenda-blocks')}
								selectLabel={__('Select icon', 'frontenda-blocks')}
								replaceLabel={__('Replace icon', 'frontenda-blocks')}
								allowedTypes={['image/svg+xml']}
								onSelect={(media: MediaSelection) => onSelectIcon(index, media)}
								onClear={() => clearIcon(index)}
							/>
						)}
					</div>
				</div>
			)}

			{fields.post && (
				<div className="grid gap-3 rounded-[1.25rem] bg-neutral-50 p-3">
					<SelectControl
						__next40pxDefaultSize
						label={__('Post', 'frontenda-blocks')}
						value={String(item.post ?? 0)}
						options={personOptions}
						onChange={(value: string) => {
							updateItem(index, {
								...item,
								post: value === '0' ? null : Number(value),
							});
						}}
					/>
					{item.post ? (
						<SelectedPostPreview
							postId={item.post}
							onClear={() => updateItem(index, { ...item, post: null })}
						/>
					) : (
						<div className="type-small text-neutral-500">{__('No post selected yet.', 'frontenda-blocks')}</div>
					)}
				</div>
			)}
		</div>
	);
}
