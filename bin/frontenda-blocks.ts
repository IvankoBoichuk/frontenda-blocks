#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , command, ...args] = process.argv;
const root = resolve(dirname(import.meta.path), '..');
const metadataPath = resolve(root, 'blocks/section/block.json');

function option(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function metadata(): Promise<any> {
  return JSON.parse(await Bun.file(metadataPath).text());
}

async function check(): Promise<void> {
  const data = await metadata();
  const variations = data.variations || [];
  const names = variations.map((item: any) => item.name);
  const duplicates = names.filter((name: string, index: number) => names.indexOf(name) !== index);
  if (duplicates.length) fail(`duplicate variations: ${[...new Set(duplicates)].join(', ')}`);
  for (const variation of variations) {
    if (!data.faConfig?.variations?.[variation.name]) fail(`missing faConfig.variations.${variation.name}`);
  }
  console.log(`OK: ${variations.length} variations, block ${data.name}`);
}

async function addVariant(): Promise<void> {
  const name = args[0];
  if (!name || name.startsWith('--')) fail('usage: add-variant <name> --title <title> --layouts 1,2 --blocks fa/header,fa/text');
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) fail('variant name must be a WordPress slug');

  const data = await metadata();
  if ((data.variations || []).some((item: any) => item.name === name)) fail(`variant "${name}" already exists`);

  const title = option('title') || name.split(/[-_]/).map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  const layouts = (option('layouts') || '1').split(',').map((value) => value.trim()).filter(Boolean);
  const blocks = (option('blocks') || 'fa/header,fa/text,fa/buttons,fa/media').split(',').map((value) => value.trim()).filter(Boolean);
  const invalidBlocks = blocks.filter((block) => !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(block));
  if (invalidBlocks.length) fail(`invalid block names: ${invalidBlocks.join(', ')}`);

  data.faConfig ||= {};
  data.faConfig.variations ||= {};
  data.faConfig.variations[name] = { template: blocks.map((block) => [block, {}]) };
  data.variations ||= [];
  data.variations.push({
    name,
    title,
    icon: option('icon') || 'layout',
    description: option('description') || `${title} section.`,
    attributes: {
      variant: name,
      layout: layouts[0] || '',
      layouts: layouts.map((value, index) => ({ label: `Layout ${index + 1}`, value })),
    },
    isActive: ['variant'],
    scope: ['inserter'],
  });

  await Bun.write(metadataPath, JSON.stringify(data, null, 2) + '\n');
  for (const layout of layouts) {
    const template = resolve(root, `templates/section/${name}-${layout}.php`);
    if (!existsSync(template)) {
      await Bun.write(template, `<?php\n/** Variant: ${name}; layout: ${layout}. */\ninclude __DIR__ . '/section.php';\n`);
    }
  }
  console.log(`Added ${name} with layouts: ${layouts.join(', ')}`);
}

if (command === 'add-variant') await addVariant();
else if (command === 'check') await check();
else fail('commands: add-variant, check');
