<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

use Timber\Image;
use Timber\ImageHelper;
use Timber\Timber;
use Throwable;

final class MediaRenderer
{
    private const DEVICE_MEDIA = [
        'mobile' => '(max-width: 767px)',
        'tablet' => '(min-width: 768px) and (max-width: 1023px)',
        'desktop' => '(min-width: 1024px)',
    ];

    /** @param array<string, string> $sources */
    public function render(int $attachmentId, string $priority, string $style, array $sources = []): string
    {
        $priority = $priority === 'high' ? 'high' : 'low';
        $image = $this->getImage($attachmentId);

        if (! $image instanceof Image) {
            return '';
        }

        $sources = $this->sources($image, $sources);
        $imageHtml = $this->image($image, $priority, $style);
        return $sources !== []
            ? '<picture class="fa-media__picture">' . implode('', array_column($sources, 'html')) . $imageHtml . '</picture>'
            : $imageHtml;
    }

    public function attachment(int $attachmentId, string $size = 'full'): string
    {
        $image = $this->getImage($attachmentId);
        if (! $image instanceof Image) {
            return '';
        }

        return '<img ' . $this->attributes([
            'src' => $image->src($size),
            'srcset' => $image->srcset($size),
            'sizes' => $image->img_sizes($size),
            'alt' => $image->alt() ?? '',
            'loading' => 'lazy',
            'decoding' => 'async',
        ]) . '>';
    }

    private function getImage(int $attachmentId): ?Image
    {
        if ($attachmentId === 0 || ! class_exists(Timber::class)) {
            return null;
        }

        try {
            return Timber::get_image($attachmentId);
        } catch (Throwable) {
            return null;
        }
    }

    private function image(Image $image, string $priority, string $style): string
    {
        $attributes = [
            'src' => $image->src(),
            'alt' => $image->alt() ?? '',
            'class' => 'fa-media__image',
            'width' => $image->width(),
            'height' => $image->height(),
            'style' => $style,
            'fetchpriority' => $priority,
            'loading' => $priority === 'high' ? 'eager' : 'lazy',
            'decoding' => 'async',
        ];

        return '<img ' . $this->attributes($attributes) . '>';
    }

    /** @param array<string, string> $rawSources */
    private function sources(Image $image, array $rawSources): array
    {
        $sources = [];
        $orderedSources = array_replace(
            array_diff_key($rawSources, self::DEVICE_MEDIA),
            array_intersect_key($rawSources, self::DEVICE_MEDIA),
        );

        foreach ($orderedSources as $device => $rawSize) {
            if (! is_string($device) || ! is_string($rawSize)) {
                continue;
            }

            $size = sanitize_text_field($rawSize);
            $media = self::DEVICE_MEDIA[$device] ?? sanitize_text_field($device);

            if ($size === '' || $media === '') {
                continue;
            }

            $url = $this->resizeUrl($image, $size);
            if ($url === '') {
                continue;
            }

            $sources[] = [
                'device' => $device,
                'media' => $media,
                'size' => $size,
                'url' => $url,
                'html' => sprintf(
                    '<source media="%s" srcset="%s">',
                    esc_attr($media),
                    esc_url($url)
                ),
            ];
        }

        return $sources;
    }

    private function resizeUrl(Image $image, string $size): string
    {
        if (preg_match('/^(\d+)x(\d+)$/i', $size, $matches) !== 1) {
            return '';
        }

        $width = max(1, (int) $matches[1]);
        $height = max(1, (int) $matches[2]);

        $filtered = apply_filters(
            'frontenda_blocks/media/resize_url',
            '',
            $image->ID,
            $size,
            $width,
            $height,
            true
        );
        if (is_string($filtered) && $filtered !== '') {
            return $filtered;
        }

        try {
            $resolved = ImageHelper::resize($image->src(), $width, $height, 'center');

            if (
                is_string($resolved)
                && $resolved !== ''
                && $this->hasDimensions($resolved, $width, $height)
            ) {
                return $resolved;
            }
        } catch (Throwable) {
            return '';
        }

        return '';
    }

    private function hasDimensions(string $url, int $width, int $height): bool
    {
        $uploads = wp_get_upload_dir();
        $baseUrl = is_string($uploads['baseurl'] ?? null) ? $uploads['baseurl'] : '';
        $baseDir = is_string($uploads['basedir'] ?? null) ? $uploads['basedir'] : '';

        if ($baseUrl === '' || $baseDir === '' || ! str_starts_with($url, $baseUrl)) {
            return false;
        }

        $relative = ltrim(substr($url, strlen($baseUrl)), '/');
        $path = trailingslashit($baseDir) . $relative;
        $dimensions = is_file($path) ? getimagesize($path) : false;

        return is_array($dimensions)
            && (int) ($dimensions[0] ?? 0) === $width
            && (int) ($dimensions[1] ?? 0) === $height;
    }

    private function attributes(array $attributes): string
    {
        $html = [];
        foreach ($attributes as $name => $value) {
            if ($value === '' || $value === 0 || $value === null) {
                continue;
            }

            $html[] = sprintf('%s="%s"', esc_attr((string) $name), esc_attr((string) $value));
        }

        return implode(' ', $html);
    }
}
