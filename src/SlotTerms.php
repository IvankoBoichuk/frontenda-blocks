<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Timber\Term;
use Timber\Timber;
use Throwable;

final class SlotTerms extends Slot
{
    /** @var list<Term>|null */
    private ?array $resolvedTerms = null;

    /** @param list<int> $termIds */
    public function __construct(
        string $name,
        string $blockName,
        array $attributes,
        private readonly string $mode,
        private readonly string $taxonomy,
        private readonly array $termIds,
        private readonly int $perPage,
        private readonly string $orderBy,
        private readonly string $order,
        private readonly bool $hideEmpty,
        private readonly string $nameLike,
    ) {
        parent::__construct($name, $blockName, $attributes, null);
    }

    public function mode(): string { return $this->mode; }
    public function taxonomy(): string { return $this->taxonomy; }

    /** @return list<int> */
    public function termIds(): array { return $this->termIds; }

    public function perPage(): int { return $this->perPage; }
    public function orderBy(): string { return $this->orderBy; }
    public function order(): string { return $this->order; }
    public function hideEmpty(): bool { return $this->hideEmpty; }
    public function nameLike(): string { return $this->nameLike; }
    public function isAutomatic(): bool { return $this->mode === 'automatic'; }
    public function isManual(): bool { return $this->mode === 'manual'; }

    public function arguments(): array
    {
        $arguments = [
            'taxonomy' => $this->taxonomy,
            'hide_empty' => $this->hideEmpty,
        ];

        if ($this->isManual()) {
            $arguments += [
                'include' => $this->termIds !== [] ? $this->termIds : [0],
                'orderby' => 'include',
                'number' => max(1, count($this->termIds)),
            ];
        } else {
            $arguments += [
                'number' => $this->perPage,
                'orderby' => $this->orderBy,
                'order' => $this->order,
            ];

            if ($this->nameLike !== '') {
                $arguments['name__like'] = $this->nameLike;
            }
        }

        $filtered = apply_filters('frontenda_blocks/terms/args', $arguments, $this);

        return is_array($filtered) ? $filtered : $arguments;
    }

    /** @return list<Term> */
    public function terms(): array
    {
        if ($this->resolvedTerms !== null) {
            return $this->resolvedTerms;
        }

        try {
            $terms = Timber::get_terms($this->arguments());
            $this->resolvedTerms = $terms === null
                ? []
                : array_values(iterator_to_array($terms));
        } catch (Throwable) {
            $this->resolvedTerms = [];
        }

        return $this->resolvedTerms;
    }

    /**
     * Total number of terms the automatic query matches, ignoring `number`.
     *
     * A "load more" control needs to know whether anything remains beyond the
     * rendered page, which terms() alone cannot answer.
     */
    public function total(): int
    {
        $arguments = $this->arguments();
        unset($arguments['number'], $arguments['offset'], $arguments['orderby'], $arguments['order']);
        $arguments['fields'] = 'count';

        $count = get_terms($arguments);

        return is_wp_error($count) ? count($this->terms()) : (int) $count;
    }

    public function isEmpty(): bool
    {
        return $this->terms() === [];
    }

    public function toArray(): array
    {
        return parent::toArray() + [
            'mode' => $this->mode,
            'taxonomy' => $this->taxonomy,
            'term_ids' => $this->termIds,
            'per_page' => $this->perPage,
            'order_by' => $this->orderBy,
            'order' => $this->order,
            'hide_empty' => $this->hideEmpty,
            'name_like' => $this->nameLike,
            'terms' => $this->terms(),
        ];
    }
}
