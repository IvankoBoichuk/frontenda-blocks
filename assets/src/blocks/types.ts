export type BlockTemplateItem = [
    name: string,
    attributes: Record<string, unknown>,
    innerBlocks?: BlockTemplate,
];

export type BlockTemplate = BlockTemplateItem[];
