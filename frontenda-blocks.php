<?php
/**
 * Plugin Name: Frontenda Blocks
 * Description: Reusable dynamic section block with extensible variants and layouts.
 * Version: 0.1.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: Frontenda
 * Text Domain: frontenda-blocks
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

define('FRONTENDA_BLOCKS_FILE', __FILE__);
define('FRONTENDA_BLOCKS_DIR', plugin_dir_path(__FILE__));

require_once FRONTENDA_BLOCKS_DIR . 'src/Slot.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotText.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotButtons.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotTitle.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotSubtitle.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotHeader.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotMedia.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotListItem.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotList.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotQuery.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotNumber.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotNumbers.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotComment.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotReviews.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/ButtonIconExtension.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SlotCollection.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/SectionContext.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/MediaRenderer.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/ContextBuilder.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/Renderer.php';
require_once FRONTENDA_BLOCKS_DIR . 'src/Plugin.php';

Frontenda\Blocks\Plugin::boot();
