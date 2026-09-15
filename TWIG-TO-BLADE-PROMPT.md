# Prompt: Twig to Blade section template

Скопіюй текст нижче в чат, відкритий у папці WordPress-теми. Наприкінці вкажи variant, layout і встав Twig-верстку.

---

Потрібно перенести надану нижче Twig-верстку в Blade-шаблон поточної WordPress-теми.

## Контекст

- У проєкті використовується плагін `frontenda-blocks`.
- Плагін шукає перевизначення шаблонів секцій у папці теми `frontenda-blocks/section/`.
- Формат імені шаблону: `<variant>-<layout>.php`.
- Якщо тема працює через Sage/Acorn і підтримує Blade для цих шаблонів, використовуй відповідне розширення та наявний у темі механізм підключення Blade. Спочатку досліди структуру теми й не вигадуй нову систему рендерингу.
- Потрібно створити всі необхідні файли в правильних директоріях теми.
- Не змінюй файли плагіна.
- Використовуй наявні компоненти, partials, helpers, Tailwind-класи та conventions теми.
- Не перенось Twig-синтаксис буквально — адаптуй його до Blade і PHP API `frontenda-blocks`.
- Не додавай нові стилі, якщо верстку можна реалізувати наявними Tailwind-класами.
- Збережи структуру, responsive-поведінку, accessibility та семантику оригінальної верстки.

## Перед реалізацією

1. Переглянь структуру поточної теми.
2. Знайди, як у ній організовані Blade views, components, icons та зображення.
3. Перевір API плагіна `frontenda-blocks`, особливо `SectionContext`, `SlotHeader`, `SlotText`, `SlotMedia`, `SlotList` і `SlotListItem`.
4. Визнач variant і layout із наданої верстки або мого пояснення.
5. Якщо variant/layout неможливо визначити однозначно — постав одне коротке уточнювальне питання.

## API секції

У Blade доступний контекст секції:

```php
$context->variant();
$context->layout();
$context->anchor();
$context->nickname();

$header = $context->header();
$text = $context->text();
$media = $context->media();
$list = $context->list();
$query = $context->query();
```

Приклади використання:

```blade
{!! $header?->subtitle()?->render() !!}
{!! $header?->title()?->render() !!}
{!! $text?->render() !!}
```

## Media

Media потрібно рендерити через API плагіна:

```blade
{!! $media?->html([
    'mobile' => '372x252',
    'tablet' => '480x290',
    'desktop' => '812x458',
]) !!}
```

Розміри визнач із наданої верстки. Не використовуй прямий URL attachment, якщо достатньо `SlotMedia::html()`.

## List

```blade
@if ($list && ! $list->isEmpty())
    @foreach ($list->items() as $item)
        {{ $item->title() }}
        {!! $item->text() !!}
        {!! $item->image() !!}
        {!! $item->icon() !!}
    @endforeach
@endif
```

Доступні методи елемента списку:

```php
$item->title();
$item->subtitle();
$item->text();
$item->url();
$item->linkText();
$item->image();
$item->icon();
$item->postId();
$item->meta();
```

Налаштування списку:

```php
$list->layout();
$list->fields();
$list->hasField('ttl');
$list->hasField('subttl');
$list->hasField('text');
$list->hasField('image');
$list->hasField('icon');
```

Для layout картки `numbered-step` за замовчуванням використовуються тільки `ttl` і `text`.

## Безпека виводу

- Звичайний текст: `{{ ... }}`.
- Дозволений HTML із renderer або слотів: `{!! ... !!}`.
- URL повинні бути безпечно оброблені відповідно до conventions теми.
- Не дублюй sanitization, яка вже виконується плагіном, без необхідності.

## Очікуваний результат

- Створи потрібний Blade-шаблон секції.
- За потреби створи невеликі reusable Blade components/partials.
- Адаптуй Twig-умови, цикли, include та змінні до Blade.
- Заміни Twig-specific Timber API на API слотів `frontenda-blocks`.
- Перевір синтаксис створених PHP/Blade-файлів.
- Покажи список створених і змінених файлів.
- Коротко вкажи, які Twig-конструкції були замінені.
- Якщо в оригінальній верстці є дані, яких немає в API плагіна, не вигадуй їх: опиши, чого бракує.

## Вхідні дані

Variant: `[ВКАЖИ VARIANT]`

Layout: `[ВКАЖИ LAYOUT]`

Twig-верстка:

```twig
ВСТАВ СЮДИ TWIG
```
