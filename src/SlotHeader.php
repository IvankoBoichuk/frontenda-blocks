<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotHeader extends Slot
{
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        ?string $html,
        private readonly ?SlotSubtitle $subtitle,
        private readonly ?SlotTitle $title,
    ) {
        parent::__construct($name, $blockName, $attributes, $html, [
            'subtitle' => $subtitle,
            'title' => $title,
        ]);
    }

    public function subtitle(): ?SlotSubtitle
    {
        return $this->subtitle;
    }

    public function title(): ?SlotTitle
    {
        return $this->title;
    }
}
