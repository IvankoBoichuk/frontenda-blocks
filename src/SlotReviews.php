<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Throwable;
use WP_Comment;
use WP_Comment_Query;

final class SlotReviews extends Slot
{
    /** @var list<SlotComment>|null */
    private ?array $resolvedComments = null;

    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        private readonly string $source,
        private readonly string $mode,
        private readonly array $commentIds,
        private readonly int $perPage,
        private readonly string $order,
    ) {
        parent::__construct($name, $blockName, $attributes, null);
    }

    public function source(): string { return $this->source; }
    public function isProductReview(): bool { return $this->source === 'product_review'; }
    public function mode(): string { return $this->mode; }
    public function commentIds(): array { return $this->commentIds; }
    public function perPage(): int { return $this->perPage; }
    public function order(): string { return $this->order; }

    public function arguments(): array
    {
        $arguments = [
            'status' => 'approve',
            'type' => $this->isProductReview() ? 'review' : 'comment',
        ];

        if ($this->mode === 'manual') {
            $arguments += [
                'comment__in' => $this->commentIds !== [] ? $this->commentIds : [0],
                'number' => max(1, count($this->commentIds)),
                'orderby' => 'comment__in',
            ];
        } else {
            $arguments += [
                'number' => $this->perPage,
                'orderby' => 'comment_date_gmt',
                'order' => $this->order,
            ];
        }
        $filtered = apply_filters('frontenda_blocks/reviews/args', $arguments, $this);

        return is_array($filtered) ? $filtered : $arguments;
    }

    /** @return list<SlotComment> */
    public function comments(): array
    {
        if ($this->resolvedComments !== null) {
            return $this->resolvedComments;
        }

        try {
            $comments = (new WP_Comment_Query())->query($this->arguments());
            $this->resolvedComments = is_array($comments)
                ? array_values(array_map(
                    static fn (WP_Comment $comment): SlotComment => SlotComment::fromWordPressComment($comment),
                    array_filter($comments, static fn (mixed $comment): bool => $comment instanceof WP_Comment),
                ))
                : [];
        } catch (Throwable) {
            $this->resolvedComments = [];
        }

        return $this->resolvedComments;
    }

    public function isEmpty(): bool
    {
        return $this->comments() === [];
    }

    public function toArray(): array
    {
        return parent::toArray() + [
            'per_page' => $this->perPage,
            'source' => $this->source,
            'mode' => $this->mode,
            'comment_ids' => $this->commentIds,
            'order' => $this->order,
            'comments' => array_map(
                static fn (SlotComment $comment): array => $comment->toArray(),
                $this->comments(),
            ),
        ];
    }
}
