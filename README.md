# Frontenda Blocks

Автономний WordPress-плагін із динамічним Gutenberg-блоком `fa/section` і структурованими блоками контенту. Для роботи плагіна вихідна тема не потрібна.

## Структура блоків

`fa/section` — контейнер для layout і variation. Він приймає лише такі безпосередні дочірні блоки:

- `fa/header` — обгортка для `fa/subtitle` і `fa/title`; кожен із них приймає core-блок заголовка або абзацу;
- `fa/text` — core-блоки абзацу, заголовка, списку, цитати й розділювача;
- `fa/buttons` — core-блок кнопок;
- `fa/media` — конфігурація зображення, галереї або відео;
- `fa/list` — структуровані елементи повторюваного списку.
- `fa/query` — автоматична або ручна вибірка записів довільного зареєстрованого post type.

Блок `core/button` всередині `fa/buttons` розширено налаштуваннями SVG attachment-іконки та її позиції `left/right`. Media Library picker показує лише `image/svg+xml`; інші MIME типи додатково відхиляються під час вибору та PHP-render. На frontend іконка рендериться як декоративне Timber-зображення всередині посилання кнопки.

Кнопки також мають незалежні параметри `variant` (`fill` або `outline`) і `size` (`sm`, `md`, `lg`). PHP-renderer додає до посилання явний набір Tailwind-класів із `ButtonStyleExtension`; тема повинна включати PHP-файли цього плагіна до Tailwind content sources. Кольори спираються на design token `main`, наприклад `bg-main`, `text-main` і `border-main`.

PHP-renderer формує `slots` і `sequence` з дерева дочірніх блоків. Шаблони секцій можуть використовувати нормалізовані значення `header`, `text`, `buttons`, `media` і `list` або отримувати всі входження через `slots`.

### Responsive media

У `fa/media` редактор задає зображення, focal point, zoom і `priority`. Priority `high` додає `fetchpriority="high"` та `loading="eager"`; `low` додає `fetchpriority="low"` та `loading="lazy"`.

Responsive-розміри належать дизайну і задаються безпосередньо в PHP-шаблоні через `SlotMedia::html()`:

```php
echo $media?->html([
    'mobile' => '372x252',
    'tablet' => '480x290',
    'desktop' => '812x458',
    '(min-width: 1440px)' => '1200x675',
]);
```

Для `mobile`, `tablet` і `desktop` renderer використовує вбудовані media query. Будь-який інший ключ використовується як custom media query. Розмір повинен мати точний формат `WIDTHxHEIGHT`; неправильні значення не рендеряться.

Renderer отримує attachment через `Timber\Timber::get_image()` і створює фізично обрізані responsive-зображення через `Timber\ImageHelper::resize()`. URL також можна перевизначити через фільтр:

```php
add_filter(
    'frontenda_blocks/media/resize_url',
    function (string $url, int $attachmentId, string $size, ?int $width, ?int $height, bool $crop): string {
        return $url;
    },
    10,
    6
);
```

## Встановлення

Розмістіть цю директорію в `web/app/plugins/frontenda-blocks`, після чого активуйте **Frontenda Blocks** у WordPress.

Плагін залежить від Timber 2.5 або новішого, але не залежить від Sage чи Acorn. Gutenberg-редактор реалізований на TypeScript/TSX.

Після змін у TSX зберіть editor assets:

```bash
bun install
bun run build
```

Згенеровані директорії `blocks/section/build/` і `dist/` не зберігаються в Git. Під час публікації GitHub Release workflow самостійно збирає assets, створює ZIP плагіна, зберігає його як workflow artifact і прикріплює до релізу.

## Додавання variation

Запустіть із директорії плагіна:

```bash
bunx frontenda-blocks add-variant hero \
  --title "Hero" \
  --layouts 1,2 \
  --blocks fa/header,fa/text,fa/buttons,fa/media
```

Під час локальної розробки використовуйте еквівалентну команду:

```bash
bun run add-variant hero --title "Hero" --layouts 1,2
```

Команда оновлює `block.json` і створює `templates/section/hero-1.php` та `hero-2.php`. Для перевірки metadata виконайте `bun run check`.

Щоб команда у формі `bunx frontenda-blocks ...` працювала поза цим репозиторієм, пакет потрібно опублікувати в npm.

## Точки розширення

- `frontenda_blocks/section/context` змінює типізований об'єкт `SectionContext`;
- `frontenda_blocks/section/template` вибирає PHP-шаблон;
- `frontenda_blocks/section/slot_names` додає відповідність між блоком і frontend-слотом;
- `frontendaBlocks.section.allowedBlocks` змінює дозволені дочірні блоки в редакторі;
- `frontendaBlocks.section.template` змінює початковий inner-block template у редакторі.

Шаблони шукаються від найточнішого до загального: `<variant>-<layout>.php`, `<variant>.php`, `<layout>.php`, потім `section.php`.

### Перевизначення шаблонів із теми

Розмістіть шаблони секцій в активній темі в директорії `frontenda-blocks/section/`. Дочірня тема має пріоритет над батьківською, а шаблони теми — над шаблонами плагіна.

Наприклад, шаблон першого layout для Offer можна перевизначити файлом:

```text
your-theme/frontenda-blocks/section/offer-1.php
```

У темі діє такий самий порядок fallback: `offer-1.php`, `offer.php`, `1.php`, потім `section.php`. Фільтр `frontenda_blocks/section/template` також може програмно вибрати інший абсолютний шлях до шаблону.

### Додавання variation, специфічної для сайту

Підключіть editor script теми із залежністю від `frontenda-blocks-section-editor`. Зареєструйте variation через стандартний Gutenberg API, після чого розширте секцію лише для цієї variation:

```js
const { registerBlockVariation } = wp.blocks;
const { addFilter } = wp.hooks;

registerBlockVariation('fa/section', {
    name: 'testimonials',
    title: 'Testimonials',
    icon: 'format-quote',
    attributes: {
        variant: 'testimonials',
        layouts: [{ label: 'First', value: '1' }],
    },
    isActive: ['variant'],
    scope: ['inserter'],
});

addFilter(
    'frontendaBlocks.section.allowedBlocks',
    'site/testimonials-allowed-blocks',
    (blocks, variant) => variant === 'testimonials'
        ? [...blocks, 'site/testimonials']
        : blocks,
);

addFilter(
    'frontendaBlocks.section.template',
    'site/testimonials-template',
    (template, variant) => variant === 'testimonials'
        ? [
            ['fa/header', {}],
            ['fa/list', {}],
            ['site/testimonials', {}],
        ]
        : template,
);
```

Умовний фільтр `allowedBlocks` керує inserter і визначає, які блоки можна розміщувати безпосередньо всередині поточної variation секції. Фільтр template задає лише початкові блоки для нової порожньої секції.

У PHP потрібно зіставити блок теми з frontend-слотом:

```php
add_filter('frontenda_blocks/section/slot_names', function (array $slots): array {
    $slots['site/testimonials'] = 'testimonials';

    return $slots;
});
```

Після цього шаблон теми може отримати всі блоки відгуків через `$slots['testimonials']`. Кожен нормалізований елемент містить `block_name`, `attributes` і відрендерений `html`.

### Типізований контекст

Renderer передає в шаблон типізований об'єкт `Frontenda\Blocks\SectionContext` із приватними readonly-властивостями та гетерами:

```php
/** @var Frontenda\Blocks\SectionContext $context */

$variant = $context->variant();
$layout = $context->layout();
$header = $context->header();
$media = $context->media();
$list = $context->list();
$testimonials = $context->slots()->all('testimonials');

echo $header?->subtitle()?->render();

echo $media?->html([
    'mobile' => '372x252',
    'desktop' => '812x458',
]);

foreach ($list?->items() ?? [] as $item) {
    echo esc_html($item->title());
}
```

Стандартні блоки представлені конкретними типами `SlotHeader`, `SlotTitle`, `SlotSubtitle`, `SlotText`, `SlotButtons`, `SlotMedia`, `SlotList` і `SlotQuery`. Елементи списку мають тип `SlotListItem`. Спільний базовий `Slot` надає getters `name()`, `blockName()`, `attributes()`, `html()` і `data()`, а конкретні типи додають власне API.

`SectionContext` надає типізовані getters `header()`, `text()`, `buttons()`, `media()`, `list()` і `query()`. Універсальна колекція `slots()` залишається для додаткових блоків, зареєстрованих темою.

### Query slot

У редакторі `fa/query` дозволяє вибрати automatic або manual режим і будь-який доступний через REST API зареєстрований post type, включно з WooCommerce products. Automatic режим має кількість і сортування; manual режим зберігає вибрані записи та їх порядок.

У шаблоні query повертає типізовані Timber posts:

```php
$query = $context->query();

foreach ($query?->posts() ?? [] as $post) {
    echo esc_html($post->title());
}
```

Аргументи `Timber::get_posts()` можна доповнити для конкретного сайту:

```php
add_filter(
    'frontenda_blocks/query/args',
    function (array $arguments, Frontenda\Blocks\SlotQuery $query): array {
        return $arguments;
    },
    10,
    2,
);
```

Для сумісності зі зручним синтаксисом шаблонів renderer також виконує `extract($context->toArray())`, тому змінні `$header`, `$text`, `$buttons`, `$media`, `$list`, `$slots` і `$sequence` залишаються доступними.

Фільтр контексту повинен повернути `SectionContext`. Значення іншого типу буде проігноровано:

```php
add_filter(
    'frontenda_blocks/section/context',
    function (Frontenda\Blocks\SectionContext $context): Frontenda\Blocks\SectionContext {
        return $context;
    }
);
```
