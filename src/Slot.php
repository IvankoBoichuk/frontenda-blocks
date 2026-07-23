<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class Slot
{
    public function __construct(
        private readonly string $name,
        private readonly string $blockName,
        private readonly array $attributes,
        private readonly ?string $html = null,
        private readonly array $data = [],
    ) {
    }

    public function name(): string
    {
        return $this->name;
    }

    public function blockName(): string
    {
        return $this->blockName;
    }

    public function attributes(): array
    {
        return $this->attributes;
    }

    public function html(): ?string
    {
        return $this->html;
    }

    public function data(): array
    {
        return $this->data;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->data[$key] ?? $default;
    }

    public function toArray(): array
    {
        return [
            'block_name' => $this->blockName,
            'attributes' => $this->attributes,
            'html' => $this->html,
        ] + $this->data;
    }
}
