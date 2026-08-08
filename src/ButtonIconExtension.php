<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Timber\Image;
use Timber\Timber;
use Throwable;
use WP_HTML_Tag_Processor;

final class ButtonIconExtension
{
    public static function registerAttributes(array $args, string $blockType): array
    {
        if ($blockType !== 'core/button') {
            return $args;
        }

        $args['attributes'] = is_array($args['attributes'] ?? null) ? $args['attributes'] : [];
        $args['attributes']['faIconId'] = [
            'type' => 'number',
            'default' => 0,
        ];
        $args['attributes']['faIconPosition'] = [
            'type' => 'string',
            'enum' => ['left', 'right'],
            'default' => 'left',
        ];

        return $args;
    }

    public static function render(string $content, array $block): string
    {
        $attributes = is_array($block['attrs'] ?? null) ? $block['attrs'] : [];
        $iconId = absint($attributes['faIconId'] ?? 0);
        if ($iconId === 0 || $content === '') {
            return $content;
        }

        $image = self::image($iconId);
        if (! $image instanceof Image) {
            return $content;
        }

        $position = ($attributes['faIconPosition'] ?? 'left') === 'right' ? 'right' : 'left';
        $processor = new WP_HTML_Tag_Processor($content);
        if (! $processor->next_tag('a')) {
            return $content;
        }

        $processor->add_class('fa-button--has-icon');
        $processor->add_class('fa-button--icon-' . $position);
        $content = $processor->get_updated_html();
        $icon = sprintf(
            '<img src="%s" class="fa-button__icon" alt="" aria-hidden="true" loading="lazy" decoding="async">',
            esc_url($image->src())
        );

        if ($position === 'right') {
            return (string) preg_replace_callback(
                '/<\/a>/',
                static fn (): string => $icon . '</a>',
                $content,
                1
            );
        }

        return (string) preg_replace_callback(
            '/<a\b[^>]*>/',
            static fn (array $matches): string => $matches[0] . $icon,
            $content,
            1
        );
    }

    private static function image(int $attachmentId): ?Image
    {
        if (get_post_mime_type($attachmentId) !== 'image/svg+xml') {
            return null;
        }

        try {
            return Timber::get_image($attachmentId);
        } catch (Throwable) {
            return null;
        }
    }
}
