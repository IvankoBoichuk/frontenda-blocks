<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class HtmlAttributes
{
    public static function render(array $attributes): string
    {
        $html = [];

        foreach ($attributes as $name => $value) {
            if ($value === null || $value === false || $value === '') {
                continue;
            }

            if ($value === true) {
                $html[] = esc_attr((string) $name);
                continue;
            }

            $html[] = sprintf('%s="%s"', esc_attr((string) $name), esc_attr((string) $value));
        }

        return implode(' ', $html);
    }
}
