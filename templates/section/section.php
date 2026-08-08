<?php
/** @var \Frontenda\Blocks\SlotHeader|null $header */
/** @var \Frontenda\Blocks\SlotText|null $text */
/** @var \Frontenda\Blocks\SlotButtons|null $buttons */
/** @var \Frontenda\Blocks\SlotMedia|null $media */
/** @var \Frontenda\Blocks\SlotList|null $list */
/** @var \Frontenda\Blocks\SlotQuery|null $query */
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php if ($header?->subtitle()?->html()) : ?>
        <div class="fa-section-block__subtitle"><?php echo $header->subtitle()->html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
    <?php endif; ?>
    <?php if ($header?->title()?->html()) : ?>
        <div class="fa-section-block__title"><?php echo $header->title()->html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
    <?php endif; ?>
    <?php if ($text?->html()) : ?><div class="fa-section-block__text"><?php echo wp_kses_post($text->html()); ?></div><?php endif; ?>
    <?php if ($media) : ?><div class="fa-section-block__media"><?php echo $media->html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div><?php endif; ?>
    <?php if ($list && ! $list->isEmpty()) : ?>
        <ul class="fa-section-block__list">
            <?php foreach ($list->items() as $item) : ?>
                <li class="fa-section-block__item">
                    <?php echo $item->image(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    <?php echo $item->icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    <?php if ($item->title()) : ?><h3><?php echo esc_html($item->title()); ?></h3><?php endif; ?>
                    <?php if ($item->text()) : ?><div><?php echo wp_kses_post($item->text()); ?></div><?php endif; ?>
                    <?php if ($item->url()) : ?><a href="<?php echo esc_url($item->url()); ?>"><?php echo esc_html($item->linkText() ?: $item->title()); ?></a><?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
    <?php if ($query && ! $query->isEmpty()) : ?>
        <ul class="fa-section-block__query">
            <?php foreach ($query->posts() as $post) : ?>
                <li><a href="<?php echo esc_url($post->link()); ?>"><?php echo esc_html($post->title()); ?></a></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
    <?php echo $buttons?->html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</section>
