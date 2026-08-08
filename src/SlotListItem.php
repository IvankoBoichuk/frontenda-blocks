<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class SlotListItem
{
    public function __construct(
        private readonly string $title,
        private readonly string $subtitle,
        private readonly string $text,
        private readonly string $url,
        private readonly string $linkText,
        private readonly string $image,
        private readonly string $icon,
        private readonly int $postId,
        private readonly array $meta,
    ) {
    }

    public function title(): string { return $this->title; }
    public function subtitle(): string { return $this->subtitle; }
    public function text(): string { return $this->text; }
    public function url(): string { return $this->url; }
    public function linkText(): string { return $this->linkText; }
    public function image(): string { return $this->image; }
    public function icon(): string { return $this->icon; }
    public function postId(): int { return $this->postId; }
    public function meta(): array { return $this->meta; }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'text' => $this->text,
            'url' => $this->url,
            'link_text' => $this->linkText,
            'image' => $this->image,
            'icon' => $this->icon,
            'post' => $this->postId,
            'meta' => $this->meta,
        ];
    }
}
