<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use WP_Block;

final class Renderer
{
    public static function render(array $attributes, string $content, WP_Block $block): string
    {
        $context = (new ContextBuilder())->build($attributes, $content, $block);
        $templates = $context->templates();
        $template = apply_filters('frontenda_blocks/section/template', self::firstExisting($templates), $templates, $context);

        if (! is_string($template) || ! is_readable($template)) {
            return '';
        }

        ob_start();
        extract($context->toArray(), EXTR_SKIP);
        include $template;
        return (string) ob_get_clean();
    }

    private static function firstExisting(array $templates): ?string
    {
        foreach ($templates as $template) {
            if (is_readable($template)) {
                return $template;
            }
        }

        return null;
    }
}
