<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotNumbers extends Slot
{
    /** @param list<SlotNumber> $items */
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        ?string $html,
        private readonly array $items,
    ) {
        parent::__construct($name, $blockName, $attributes, $html, [
            'items' => $items,
        ]);
    }

    /** @return list<SlotNumber> */
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
                static fn (SlotNumber $item): array => $item->toArray(),
                $this->items,
            ),
        ]);
    }
}
