<?php

declare(strict_types=1);

namespace Frontenda\Blocks;

final class Plugin
{
    public static function boot(): void
    {
        add_action('init', [self::class, 'registerEditorScript'], 5);
        add_action('init', [self::class, 'registerBlock']);
        add_filter('block_categories_all', [self::class, 'registerCategory']);
        add_filter('register_block_type_args', [ButtonIconExtension::class, 'registerAttributes'], 10, 2);
        add_filter('render_block_core/button', [ButtonIconExtension::class, 'render'], 10, 2);
    }

    public static function registerBlock(): void
    {
        register_block_type(FRONTENDA_BLOCKS_DIR . 'blocks/section', [
            'render_callback' => [Renderer::class, 'render'],
        ]);

        foreach (['header', 'title', 'subtitle', 'text', 'buttons', 'media', 'list', 'query', 'number', 'numbers'] as $block) {
            register_block_type(FRONTENDA_BLOCKS_DIR . 'blocks/' . $block);
        }
    }

    public static function registerCategory(array $categories): array
    {
        if (! array_filter($categories, static fn (array $category): bool => ($category['slug'] ?? '') === 'frontenda')) {
            array_unshift($categories, [
                'slug' => 'frontenda',
                'title' => __('Frontenda Blocks', 'frontenda-blocks'),
                'icon' => 'layout',
            ]);
        }

        return $categories;
    }

    public static function registerEditorScript(): void
    {
        $scriptFile = FRONTENDA_BLOCKS_DIR . 'blocks/section/build/index.js';

        if (! is_readable($scriptFile)) {
            return;
        }

        wp_register_script(
            'frontenda-blocks-section-editor',
            plugins_url('blocks/section/build/index.js', FRONTENDA_BLOCKS_FILE),
            self::editorScriptDependencies(),
            filemtime($scriptFile),
            true
        );
    }

    private static function editorScriptDependencies(): array
    {
        return [
            'wp-blocks',
            'wp-block-editor',
            'wp-components',
            'wp-compose',
            'wp-core-data',
            'wp-data',
            'wp-element',
            'wp-hooks',
            'wp-i18n',
        ];
    }
}
