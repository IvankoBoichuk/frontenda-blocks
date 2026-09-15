<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use WP_Comment;

final class SlotComment
{
    private readonly float $decimal;
    private readonly bool $hasPartialStar;
    private readonly int $partialStarFill;
    private readonly int $totalEmptyStars;
    private readonly string $gradientId;

    public function __construct(
        private readonly int $id,
        private readonly string $name,
        private readonly string $location,
        private readonly float $rating,
        private readonly int $fullStars,
        private readonly string $text,
    ) {
        $this->decimal = $this->rating - $this->fullStars;
        $this->hasPartialStar = $this->decimal >= 0.1;
        $this->partialStarFill = (int) round($this->decimal * 100);
        $this->totalEmptyStars = $this->hasPartialStar
            ? 5 - $this->fullStars - 1
            : 5 - $this->fullStars;
        $this->gradientId = "review-star-{$this->id}";
    }

    public static function fromWordPressComment(WP_Comment $comment): self
    {
        $location = (string) get_comment_meta($comment->comment_ID, 'location', true);
        $rating = (float) (get_comment_meta($comment->comment_ID, 'rating', true) ?? 0);

        return new self(
            id: (int) $comment->comment_ID,
            name: (string) ($comment->comment_author ?? ''),
            location: $location,
            rating: $rating,
            fullStars: (int) floor($rating),
            text: (string) ($comment->comment_content ?? ''),
        );
    }

    public function id(): int { return $this->id; }
    public function name(): string { return $this->name; }
    public function location(): string { return $this->location; }
    public function rating(): float { return $this->rating; }
    public function fullStars(): int { return $this->fullStars; }
    public function text(): string { return $this->text; }
    public function decimal(): float { return $this->decimal; }
    public function hasPartialStar(): bool { return $this->hasPartialStar; }
    public function partialStarFill(): int { return $this->partialStarFill; }
    public function totalEmptyStars(): int { return $this->totalEmptyStars; }
    public function gradientId(): string { return $this->gradientId; }

    public function toArray(): array
    {
        return [
            'review_id' => $this->id,
            'name' => $this->name,
            'location' => $this->location,
            'rating' => $this->rating,
            'full_stars' => $this->fullStars,
            'text' => $this->text,
            'decimal' => $this->decimal,
            'has_partial_star' => $this->hasPartialStar,
            'partial_star_fill' => $this->partialStarFill,
            'total_empty_stars' => $this->totalEmptyStars,
            'gradient_id' => $this->gradientId,
        ];
    }
}
