# Frontenda Blocks

Автономний WordPress-плагін із динамічним Gutenberg-блоком `fa/section` і структурованими блоками контенту. Для роботи плагіна вихідна тема не потрібна.

## Структура блоків

`fa/section` — контейнер для layout і variation. Він приймає лише такі безпосередні дочірні блоки:

- `fa/header` — обгортка для `fa/subtitle` і `fa/title`; кожен із них приймає core-блок заголовка або абзацу;
- `fa/text` — core-блоки абзацу, заголовка, списку, цитати й розділювача;
- `fa/buttons` — core-блок кнопок;
- `fa/media` — конфігурація зображення, галереї або відео;
- `fa/list` — структуровані елементи повторюваного списку.

PHP-renderer формує `slots` і `sequence` з дерева дочірніх блоків. Шаблони секцій можуть використовувати нормалізовані значення `header`, `text`, `buttons`, `media` і `list` або отримувати всі входження через `slots`.

## Встановлення

Розмістіть цю директорію в `web/app/plugins/frontenda-blocks`, після чого активуйте **Frontenda Blocks** у WordPress.

Плагін не залежить від Timber, Sage або Acorn. Gutenberg-редактор реалізований на TypeScript/TSX.

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
  --elements subttl,ttl,text,buttons,media \
  --defaults ttl,text,media
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
$header = $context->slots()->first('header');
$testimonials = $context->slots()->all('testimonials');

if ($context->slots()->has('media')) {
    // ...
}
```

Кожен елемент колекції — це `Frontenda\Blocks\Slot` із гетерами `name()`, `blockName()`, `attributes()`, `html()` і `data()`. Метод `$slot->get('items', [])` надає доступ до специфічних нормалізованих даних.

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

## Сумісність

Початковий контракт атрибутів походить від `uu/section`, але зареєстрована назва блока — `fa/section`. Міграція наявного серіалізованого контенту `uu/section` навмисно не виконується.
