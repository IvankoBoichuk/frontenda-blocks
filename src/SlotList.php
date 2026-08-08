<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotList extends Slot
{
    /** @param list<SlotListItem> $items */
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        private readonly ?string $layout,
        private readonly ?array $title,
        private readonly ?string $textIfEmpty,
        private readonly array $items,
    ) {
        parent::__construct($name, $blockName, $attributes, null, [
            'layout' => $layout,
            'title' => $title,
            'text_if_empty' => $textIfEmpty,
            'items' => $items,
        ]);
    }

    public function layout(): ?string { return $this->layout; }
    public function title(): ?array { return $this->title; }
    public function textIfEmpty(): ?string { return $this->textIfEmpty; }

    /** @return list<SlotListItem> */
    public function items(): array
    {
        return $this->items;
    }

    public function isEmpty(): bool
    {
        return $this->items === [];
    }

    public function toArray(): array
    {
        return array_replace(parent::toArray(), [
            'items' => array_map(
                static fn (SlotListItem $item): array => $item->toArray(),
                $this->items,
            ),
        ]);
    }
}
