<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Timber\Post;
use Timber\Timber;
use Throwable;

final class SlotQuery extends Slot
{
    /** @var list<Post>|null */
    private ?array $resolvedPosts = null;

    /** @param list<int> $postIds */
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        private readonly string $mode,
        private readonly string $postType,
        private readonly array $postIds,
        private readonly int $perPage,
        private readonly string $orderBy,
        private readonly string $order,
    ) {
        parent::__construct($name, $blockName, $attributes, null);
    }

    public function mode(): string { return $this->mode; }
    public function postType(): string { return $this->postType; }

    /** @return list<int> */
    public function postIds(): array { return $this->postIds; }

    public function perPage(): int { return $this->perPage; }
    public function orderBy(): string { return $this->orderBy; }
    public function order(): string { return $this->order; }
    public function isAutomatic(): bool { return $this->mode === 'automatic'; }
    public function isManual(): bool { return $this->mode === 'manual'; }

    public function arguments(): array
    {
        $arguments = [
            'post_type' => $this->postType,
            'post_status' => 'publish',
            'ignore_sticky_posts' => true,
        ];

        if ($this->isManual()) {
            $arguments += [
                'post__in' => $this->postIds !== [] ? $this->postIds : [0],
                'posts_per_page' => max(1, count($this->postIds)),
                'orderby' => 'post__in',
            ];
        } else {
            $arguments += [
                'posts_per_page' => $this->perPage,
                'orderby' => $this->orderBy,
                'order' => $this->order,
            ];
        }

        $filtered = apply_filters('frontenda_blocks/query/args', $arguments, $this);

        return is_array($filtered) ? $filtered : $arguments;
    }

    /** @return list<Post> */
    public function posts(): array
    {
        if ($this->resolvedPosts !== null) {
            return $this->resolvedPosts;
        }

        try {
            $posts = Timber::get_posts($this->arguments());
            $this->resolvedPosts = $posts === null
                ? []
                : array_values(iterator_to_array($posts));
        } catch (Throwable) {
            $this->resolvedPosts = [];
        }

        return $this->resolvedPosts;
    }

    public function isEmpty(): bool
    {
        return $this->posts() === [];
    }

    public function toArray(): array
    {
        return parent::toArray() + [
            'mode' => $this->mode,
            'post_type' => $this->postType,
            'post_ids' => $this->postIds,
            'per_page' => $this->perPage,
            'order_by' => $this->orderBy,
            'order' => $this->order,
            'posts' => $this->posts(),
        ];
    }
}
