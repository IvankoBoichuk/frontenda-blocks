<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use WP_HTML_Tag_Processor;

final class ButtonStyleExtension
{
    private const BASE_CLASSES = [
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-2',
        'rounded-md',
        'font-medium',
        'transition-colors',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-main',
        'focus-visible:ring-offset-2',
    ];

    private const VARIANT_CLASSES = [
        'fill' => [
            'border',
            'border-main',
            'bg-main',
            'text-white',
            'hover:bg-main/90',
        ],
        'outline' => [
            'border',
            'border-main',
            'bg-transparent',
            'text-main',
            'hover:bg-main',
            'hover:text-white',
        ],
    ];

    private const SIZE_CLASSES = [
        'sm' => ['min-h-8', 'px-3', 'py-1.5', 'text-sm'],
        'md' => ['min-h-10', 'px-4', 'py-2', 'text-base'],
        'lg' => ['min-h-12', 'px-6', 'py-3', 'text-lg'],
    ];

    public static function registerAttributes(array $args, string $blockType): array
    {
        if ($blockType !== 'core/button') {
            return $args;
        }

        $args['attributes'] = is_array($args['attributes'] ?? null) ? $args['attributes'] : [];
        $args['attributes']['faVariant'] = [
            'type' => 'string',
            'enum' => array_keys(self::VARIANT_CLASSES),
            'default' => 'fill',
        ];
        $args['attributes']['faSize'] = [
            'type' => 'string',
            'enum' => array_keys(self::SIZE_CLASSES),
            'default' => 'md',
        ];

        return $args;
    }

    public static function render(string $content, array $block): string
    {
        if ($content === '') {
            return $content;
        }

        $attributes = is_array($block['attrs'] ?? null) ? $block['attrs'] : [];
        $variant = self::value($attributes['faVariant'] ?? null, self::VARIANT_CLASSES, 'fill');
        $size = self::value($attributes['faSize'] ?? null, self::SIZE_CLASSES, 'md');
        $processor = new WP_HTML_Tag_Processor($content);

        if (! $processor->next_tag('a')) {
            return $content;
        }

        foreach ([...self::BASE_CLASSES, ...self::VARIANT_CLASSES[$variant], ...self::SIZE_CLASSES[$size]] as $class) {
            $processor->add_class($class);
        }

        $processor->add_class('fa-button');
        $processor->add_class('fa-button--' . $variant);
        $processor->add_class('fa-button--' . $size);

        return $processor->get_updated_html();
    }

    private static function value(mixed $value, array $allowed, string $fallback): string
    {
        return is_string($value) && isset($allowed[$value]) ? $value : $fallback;
    }
}
