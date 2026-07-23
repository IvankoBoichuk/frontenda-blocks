<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotCollection
{
    /** @var array<string, list<Slot>> */
    private array $slots = [];

    public function add(Slot $slot): int
    {
        $this->slots[$slot->name()][] = $slot;

        return count($this->slots[$slot->name()]) - 1;
    }

    public function first(string $name): ?Slot
    {
        return $this->slots[$name][0] ?? null;
    }

    /** @return list<Slot> */
    public function all(string $name): array
    {
        return $this->slots[$name] ?? [];
    }

    public function has(string $name): bool
    {
        return isset($this->slots[$name][0]);
    }

    public function toArray(): array
    {
        return array_map(
            static fn (array $slots): array => array_map(
                static fn (Slot $slot): array => $slot->toArray(),
                $slots
            ),
            $this->slots
        );
    }
}
