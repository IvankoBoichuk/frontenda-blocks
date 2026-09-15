<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Timber\Image;

final class SlotNumber
{
    public function __construct(
        private readonly string $number,
        private readonly string $label,
        private readonly ?Image $icon,
    ) {
    }

    public function number(): string
    {
        return $this->number;
    }

    public function label(): string
    {
        return $this->label;
    }

    public function icon(): ?Image
    {
        return $this->icon;
    }

    public function toArray(): array
    {
        return [
            'number' => $this->number,
            'label' => $this->label,
            'icon' => $this->icon,
        ];
    }
}
