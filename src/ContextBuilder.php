<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use WP_Block;

final class ContextBuilder
{
    private const SLOT_NAMES = [
        'fa/header' => 'header',
        'fa/text' => 'text',
        'fa/buttons' => 'buttons',
        'fa/media' => 'media',
        'fa/list' => 'list',
        'fa/query' => 'query',
    ];

    public function build(array $attributes, string $content, WP_Block $block): SectionContext
    {
        $variant = sanitize_key($attributes['variant'] ?? '');
        $layout = sanitize_key(
            $attributes['layout']
                ?? $attributes['layouts'][0]['value']
                ?? ''
        );
        $nickname = sanitize_text_field($attributes['nickname'] ?? '');
        $anchor = sanitize_title($attributes['anchor'] ?? $nickname);
        ['slots' => $slots, 'sequence' => $sequence] = $this->children($block);

        $context = new SectionContext(
            attributes: $attributes,
            variant: $variant,
            layout: $layout !== '' ? $layout : null,
            anchor: $anchor !== '' ? $anchor : null,
            nickname: $nickname !== '' ? $nickname : null,
            slots: $slots,
            sequence: $sequence,
            wrapperAttributes: $this->wrapperAttributes($variant, $layout, $anchor),
            block: $block,
        );
        $filtered = apply_filters('frontenda_blocks/section/context', $context, $attributes, $content, $block);

        return $filtered instanceof SectionContext ? $filtered : $context;
    }

    private function children(WP_Block $block): array
    {
        $slots = new SlotCollection();
        $sequence = [];
        $slotNames = apply_filters('frontenda_blocks/section/slot_names', self::SLOT_NAMES, $block);
        $slotNames = is_array($slotNames) ? $slotNames : self::SLOT_NAMES;

        foreach ($block->inner_blocks as $child) {
            $name = $slotNames[$child->name] ?? null;
            if (! is_string($name) || $name === '') {
                continue;
            }

            $slot = $this->child($name, $child);
            $sequence[] = ['type' => $name, 'index' => $slots->add($slot), 'slot' => $slot];
        }

        return ['slots' => $slots, 'sequence' => $sequence];
    }

    private function child(string $name, WP_Block $child): Slot
    {
        $attributes = (array) ($child->parsed_block['attrs'] ?? []);

        return match ($name) {
            'header' => $this->header($child, $attributes),
            'text' => new SlotText(
                $name,
                $child->name,
                $attributes,
                $this->nullableHtml($child->render()),
            ),
            'buttons' => new SlotButtons(
                $name,
                $child->name,
                $attributes,
                $this->buttonsHtml($child),
            ),
            'media' => $this->media($child, $attributes),
            'list' => $this->listSlot($child, $attributes),
            'query' => $this->querySlot($child, $attributes),
            default => new Slot(
                $name,
                $child->name,
                $attributes,
                $this->nullableHtml($child->render()),
            ),
        };
    }

    private function nullableHtml(string $html): ?string
    {
        $html = trim($html);

        return $html !== '' ? $html : null;
    }

    private function buttonsHtml(WP_Block $block): ?string
    {
        $html = $block->render();
        $text = trim(wp_strip_all_tags(html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return $text === '' ? null : trim($html);
    }

    private function header(WP_Block $header, array $attributes): SlotHeader
    {
        $parts = ['subtitle' => null, 'title' => null];

        foreach ($header->inner_blocks as $child) {
            $name = match ($child->name) {
                'fa/subtitle' => 'subtitle',
                'fa/title' => 'title',
                default => null,
            };

            if ($name === null || $parts[$name] !== null) {
                continue;
            }

            $html = trim($child->render());
            $slotClass = $name === 'subtitle' ? SlotSubtitle::class : SlotTitle::class;
            $parts[$name] = new $slotClass(
                $name,
                $child->name,
                (array) ($child->parsed_block['attrs'] ?? []),
                $html !== '' ? $html : null,
            );
        }

        return new SlotHeader(
            'header',
            $header->name,
            $attributes,
            $this->nullableHtml($header->render()),
            $parts['subtitle'],
            $parts['title'],
        );
    }

    private function heading(mixed $value, string $fallbackLevel): ?array
    {
        if (! is_array($value) || trim((string) ($value['text'] ?? '')) === '') {
            return null;
        }

        $allowed = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'];
        $level = in_array($value['level'] ?? '', $allowed, true) ? $value['level'] : $fallbackLevel;

        return ['level' => $level, 'text' => wp_kses_post(strtr((string) $value['text'], ['{' => '<span>', '}' => '</span>']))];
    }

    private function media(WP_Block $block, array $attributes): SlotMedia
    {
        $media = $attributes['media'] ?? null;
        $media = is_array($media) ? $media : [];
        $attachmentId = absint($media['attachment']['id'] ?? 0);
        $focalPoint = is_array($media['attachment']['focalPoint'] ?? null) ? $media['attachment']['focalPoint'] : [];
        $focalX = min(1.0, max(0.0, (float) ($focalPoint['x'] ?? 0.5)));
        $focalY = min(1.0, max(0.0, (float) ($focalPoint['y'] ?? 0.5)));
        $zoom = min(3.0, max(1.0, (float) ($media['attachment']['zoom'] ?? 1)));
        $style = sprintf(
            'object-position:%.2f%% %.2f%%;transform:scale(%.2f);transform-origin:%.2f%% %.2f%%',
            $focalX * 100,
            $focalY * 100,
            $zoom,
            $focalX * 100,
            $focalY * 100
        );

        return new SlotMedia(
            name: 'media',
            blockName: $block->name,
            attributes: $attributes,
            attachmentId: $attachmentId,
            priority: ($media['priority'] ?? 'low') === 'high' ? 'high' : 'low',
            style: $style,
            data: [
                'attachment_id' => $attachmentId,
                'focal_point' => ['x' => $focalX, 'y' => $focalY],
                'zoom' => $zoom,
                'priority' => ($media['priority'] ?? 'low') === 'high' ? 'high' : 'low',
            ],
        );
    }

    private function listSlot(WP_Block $block, array $attributes): SlotList
    {
        $list = is_array($attributes['list'] ?? null) ? $attributes['list'] : [];
        $layout = sanitize_key($list['layout'] ?? '');
        $textIfEmpty = sanitize_text_field($list['textIfEmpty'] ?? '');

        return new SlotList(
            'list',
            $block->name,
            $attributes,
            $layout !== '' ? $layout : null,
            $this->heading($list['ttl'] ?? null, 'h3'),
            $textIfEmpty !== '' ? $textIfEmpty : null,
            $this->listItems($list['items'] ?? []),
        );
    }

    private function querySlot(WP_Block $block, array $attributes): SlotQuery
    {
        $query = is_array($attributes['query'] ?? null) ? $attributes['query'] : [];
        $mode = ($query['mode'] ?? 'automatic') === 'manual' ? 'manual' : 'automatic';
        $postType = sanitize_key($query['postType'] ?? 'post');
        $postType = post_type_exists($postType) ? $postType : 'post';
        $postIds = array_values(array_unique(array_filter(array_map(
            'absint',
            is_array($query['postIds'] ?? null) ? $query['postIds'] : [],
        ))));
        $orderBy = sanitize_key($query['orderBy'] ?? 'date');
        $orderBy = in_array($orderBy, ['date', 'title', 'menu_order', 'rand'], true) ? $orderBy : 'date';
        $order = strtolower((string) ($query['order'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';

        return new SlotQuery(
            name: 'query',
            blockName: $block->name,
            attributes: $attributes,
            mode: $mode,
            postType: $postType,
            postIds: $postIds,
            perPage: min(24, max(1, absint($query['perPage'] ?? 6))),
            orderBy: $orderBy,
            order: $order,
        );
    }

    /** @return list<SlotListItem> */
    private function listItems(mixed $items): array
    {
        if (! is_array($items)) {
            return [];
        }

        $mediaRenderer = new MediaRenderer();

        return array_values(array_filter(array_map(static function (mixed $item) use ($mediaRenderer): ?SlotListItem {
            if (! is_array($item)) {
                return null;
            }

            $imageId = absint($item['image']['id'] ?? 0);
            $iconId = absint($item['icon']['id'] ?? 0);

            return new SlotListItem(
                title: sanitize_text_field($item['ttl']['text'] ?? ''),
                subtitle: sanitize_text_field($item['subttl']['text'] ?? ''),
                text: wp_kses_post($item['text'] ?? ''),
                url: esc_url($item['link']['url'] ?? ''),
                linkText: sanitize_text_field($item['link']['text'] ?? ''),
                image: $mediaRenderer->attachment($imageId, 'large'),
                icon: $mediaRenderer->attachment($iconId),
                postId: absint($item['post'] ?? 0),
                meta: is_array($item['meta'] ?? null) ? $item['meta'] : [],
            );
        }, $items)));
    }

    private function wrapperAttributes(string $variant, string $layout, string $anchor): string
    {
        $classes = array_filter([
            'fa-section-block',
            $variant ? 'fa-section-block--' . $variant : null,
            $layout ? 'fa-section-block--layout-' . $layout : null,
            $variant && $layout ? 'fa-section-block--' . $variant . '-' . $layout : null,
        ]);

        return get_block_wrapper_attributes(array_filter(['class' => implode(' ', $classes), 'id' => $anchor]));
    }
}
