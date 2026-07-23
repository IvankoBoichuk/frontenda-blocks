export type WP = {
    element: typeof import('@wordpress/element');
    blockEditor: typeof import('@wordpress/block-editor');
    blocks: typeof import('@wordpress/blocks');
    components: typeof import('@wordpress/components');
    data: typeof import('@wordpress/data');
    coreData: typeof import('@wordpress/core-data');
    compose: typeof import('@wordpress/compose');
    hooks: typeof import('@wordpress/hooks');
    i18n: typeof import('@wordpress/i18n');
    plugins: {
        registerPlugin: (name: string, settings: { render: () => JSX.Element | null }) => void;
    };
    editPost: {
        PluginPostStatusInfo: (props: { children?: JSX.Element | JSX.Element[] | string | null }) => JSX.Element | null;
        PluginPrePublishPanel: (props: { title: string; children?: JSX.Element | JSX.Element[] | string | null }) => JSX.Element | null;
    };
    domReady?: (callback: () => void) => void;
};

type EditorWindow = Window & typeof globalThis & {
    wp: WP;
};

export const wp = (window as EditorWindow).wp;