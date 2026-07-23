import { wp } from '@/editor/wp';

import type { MediaSelection } from '../types';

const { createElement, Fragment, useState } = wp.element;
const { MediaUpload, MediaUploadCheck } = wp.blockEditor;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const { Button, Popover } = wp.components;
const { __ } = wp.i18n;

type MediaPosition = 'left' | 'right';

type MediaEntity = {
	source_url?: string;
	media_details?: {
		sizes?: Record<string, { source_url?: string }>;
	};
};

function getMediaUrl(media?: MediaEntity | null): string {
	return media?.media_details?.sizes?.thumbnail?.source_url
		|| media?.media_details?.sizes?.medium?.source_url
		|| media?.source_url
		|| '';
}

function getPickerButtonClassName(isActive: boolean) {
	return [
		'rounded-full border px-4 py-2 transition-colors',
		isActive
			? 'border-main bg-main text-white hover:bg-main/90'
			: 'border-neutral-300 bg-white text-main hover:border-main/40 hover:bg-neutral-50',
	].join(' ');
}

function SelectedMediaPreview({
	id,
	label,
	replaceLabel,
	position,
	onPositionChange,
	onReplace,
	onClear,
}: {
	id: number;
	label: string;
	replaceLabel?: string;
	position?: MediaPosition;
	onPositionChange?: (position: MediaPosition) => void;
	onReplace?: () => void;
	onClear: () => void;
}) {
	const [isPositionOpen, setIsPositionOpen] = useState(false);
	const media = useSelect((select) => {
		if (!id) {
			return null;
		}

		return select(store).getMedia(id) as MediaEntity | null;
	}, [id]);

	const mediaUrl = getMediaUrl(media);

	if (!id) {
		return null;
	}

	return (
		<div className="flex items-center gap-3 rounded-full border border-main/20 bg-main/8 pr-3">
			<div className="size-10 overflow-hidden rounded-full border border-white/80 bg-white">
				{mediaUrl ? (
					<img src={mediaUrl} alt={label} className="size-full object-cover m-0!" />
				) : (
					<div className="flex size-full items-center justify-center text-[10px] font-medium text-main/60">
						{__('Set', 'frontenda-blocks')}
					</div>
				)}
			</div>
			<div className="text-xs font-medium text-main">{label}</div>
			{onPositionChange && (
				<div className="relative">
					<button
						type="button"
						aria-label={__('Icon position', 'frontenda-blocks')}
						className="flex size-7 items-center justify-center rounded-full border border-main/15 bg-white text-main transition-colors hover:border-main/40 hover:bg-white/80"
						onClick={() => setIsPositionOpen(!isPositionOpen)}
					>
						{(position ?? 'right') === 'left' ? '←' : '→'}
					</button>
					{isPositionOpen && (
						<Popover
							placement="top"
							onClose={() => setIsPositionOpen(false)}
						>
							<div className="flex gap-2 p-2">
								<Button
									variant={(position ?? 'right') === 'left' ? 'primary' : 'secondary'}
									onClick={() => {
										onPositionChange('left');
										setIsPositionOpen(false);
									}}
								>
									{__('Left', 'frontenda-blocks')}
								</Button>
								<Button
									variant={(position ?? 'right') === 'right' ? 'primary' : 'secondary'}
									onClick={() => {
										onPositionChange('right');
										setIsPositionOpen(false);
									}}
								>
									{__('Right', 'frontenda-blocks')}
								</Button>
							</div>
						</Popover>
					)}
				</div>
			)}
			{onReplace && (
				<button
					type="button"
					aria-label={replaceLabel}
					className="flex size-7 items-center justify-center rounded-full border border-main/15 bg-white text-main transition-colors hover:border-main/40 hover:bg-white/80"
					onClick={onReplace}
				>
					↻
				</button>
			)}
			<button
				type="button"
				className="flex size-7 items-center justify-center rounded-full border border-main/15 bg-white text-main transition-colors hover:border-red-300 hover:text-red-600"
				onClick={onClear}
			>
				×
			</button>
		</div>
	);
}

export default function ListMediaPicker({
	value,
	label,
	selectLabel,
	replaceLabel,
	allowedTypes,
	position,
	onSelect,
	onPositionChange,
	onClear,
}: {
	value?: number;
	label: string;
	selectLabel: string;
	replaceLabel: string;
	allowedTypes: string[];
	position?: MediaPosition;
	onSelect: (media: MediaSelection) => void;
	onPositionChange?: (position: MediaPosition) => void;
	onClear: () => void;
}) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={onSelect}
				allowedTypes={allowedTypes}
				value={value ?? 0}
				render={({ open }: { open: () => void }) => (
					<>
						{value ? (
							<SelectedMediaPreview
								id={value}
								label={label}
								replaceLabel={replaceLabel}
								position={position}
								onPositionChange={onPositionChange}
								onReplace={open}
								onClear={onClear}
							/>
						) : (
							<Button className={getPickerButtonClassName(false)} variant="tertiary" onClick={open}>
								{selectLabel}
							</Button>
						)}
					</>
				)}
			/>
		</MediaUploadCheck>
	);
}
