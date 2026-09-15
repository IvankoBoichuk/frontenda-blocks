<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use WP_Block;

final class SectionContext
{
    /** @param list<array{type: string, index: int, slot: Slot}> $sequence */
    public function __construct(
        private readonly array $attributes,
        private readonly string $variant,
        private readonly ?string $layout,
        private readonly ?string $anchor,
        private readonly ?string $nickname,
        private readonly SlotCollection $slots,
        private readonly array $sequence,
        private readonly string $wrapperAttributes,
        private readonly WP_Block $block,
    ) {
    }

    public function attributes(): array
    {
        return $this->attributes;
    }

    public function variant(): string
    {
        return $this->variant;
    }

    public function layout(): ?string
    {
        return $this->layout;
    }

    public function anchor(): ?string
    {
        return $this->anchor;
    }

    public function nickname(): ?string
    {
        return $this->nickname;
    }

    public function slots(): SlotCollection
    {
        return $this->slots;
    }

    public function header(): ?SlotHeader
    {
        $slot = $this->slots->first('header');

        return $slot instanceof SlotHeader ? $slot : null;
    }

    public function text(): ?SlotText
    {
        $slot = $this->slots->first('text');

        return $slot instanceof SlotText ? $slot : null;
    }

    public function buttons(): ?SlotButtons
    {
        $slot = $this->slots->first('buttons');

        return $slot instanceof SlotButtons ? $slot : null;
    }

    public function media(): ?SlotMedia
    {
        $slot = $this->slots->first('media');

        return $slot instanceof SlotMedia ? $slot : null;
    }

    public function list(): ?SlotList
    {
        $slot = $this->slots->first('list');

        return $slot instanceof SlotList ? $slot : null;
    }

    public function query(): ?SlotQuery
    {
        $slot = $this->slots->first('query');

        return $slot instanceof SlotQuery ? $slot : null;
    }

    public function numbers(): ?SlotNumbers
    {
        $slot = $this->slots->first('numbers');

        return $slot instanceof SlotNumbers ? $slot : null;
    }

    public function reviews(): ?SlotReviews
    {
        $slot = $this->slots->first('reviews');

        return $slot instanceof SlotReviews ? $slot : null;
    }

    public function sequence(): array
    {
        return $this->sequence;
    }

    public function wrapperAttributes(): string
    {
        return $this->wrapperAttributes;
    }

    public function block(): WP_Block
    {
        return $this->block;
    }

    /**
     * Gets the list of template files to search for, in order of priority.
     * @return array
     */
    public function templates(): array
    {
        $base = FRONTENDA_BLOCKS_DIR . 'templates/section/';
        $relativeTemplates = array_filter([
            $this->variant && $this->layout ? "frontenda-blocks/section/{$this->variant}-{$this->layout}.php" : null,
            $this->variant ? "frontenda-blocks/section/{$this->variant}.php" : null,
            $this->layout ? "frontenda-blocks/section/{$this->layout}.php" : null,
            'frontenda-blocks/section/section.php',
        ]);
        $themeTemplate = locate_template($relativeTemplates, false, false);

        return array_values(array_filter([
            $themeTemplate !== '' ? $themeTemplate : null,
            $this->variant && $this->layout ? "$base{$this->variant}-{$this->layout}.php" : null,
            $this->variant ? "$base{$this->variant}.php" : null,
            $this->layout ? "$base{$this->layout}.php" : null,
            "{$base}section.php",
        ]));
    }

    public function toArray(): array
    {
        $header = $this->header();
        $text = $this->text();
        $buttons = $this->buttons();
        $media = $this->media();
        $list = $this->list();
        $query = $this->query();
        $numbers = $this->numbers();
        $reviews = $this->reviews();

        return [
            'attributes' => $this->attributes,
            'variant' => $this->variant,
            'layout' => $this->layout,
            'anchor' => $this->anchor,
            'nickname' => $this->nickname,
            'slots' => $this->slots->toArray(),
            'sequence' => array_map(
                static fn (array $item): array => [
                    'type' => $item['type'],
                    'index' => $item['index'],
                ] + $item['slot']->toArray(),
                $this->sequence
            ),
            'header' => $header,
            'text' => $text,
            'buttons' => $buttons,
            'media' => $media,
            'list' => $list,
            'query' => $query,
            'numbers' => $numbers,
            'reviews' => $reviews,
            'wrapper_attributes' => $this->wrapperAttributes,
            'block' => $this->block,
            'context' => $this,
        ];
    }
}
