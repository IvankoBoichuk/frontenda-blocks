<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotMedia extends Slot
{
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        private readonly int $attachmentId,
        private readonly string $priority,
        private readonly string $style,
        array $data = [],
    ) {
        parent::__construct($name, $blockName, $attributes, null, $data);
    }

    /** @param array<string, string> $sources */
    public function html(array $sources = []): string
    {
        return (new MediaRenderer())->render(
            $this->attachmentId,
            $this->priority,
            $this->style,
            $sources,
        );
    }

    public function render(): string
    {
        return $this->html();
    }

    public function attachmentId(): int
    {
        return $this->attachmentId;
    }

    public function priority(): string
    {
        return $this->priority;
    }
}
