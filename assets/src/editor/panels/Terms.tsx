import type { Taxonomy } from '@wordpress/core-data';
import type { TermsAttributes, TermsSettings } from '@/editor/types';
import { wp } from '@/editor/wp';

const { createElement, Fragment, useState } = wp.element;
const { useSelect } = wp.data;
const { store } = wp.coreData;
const {
    Button,
    ComboboxControl,
    RadioControl,
    RangeControl,
    SelectControl,
    Spinner,
    TextControl,
    ToggleControl,
} = wp.components;
const { __ } = wp.i18n;

type Term = {
    id: number;
    name: string;
    count?: number;
};

type Props = {
    terms?: TermsSettings;
    setAttributes: (attributes: TermsAttributes) => void;
};

const DEFAULT_TERMS: TermsSettings = {
    mode: 'automatic',
    taxonomy: 'category',
    termIds: [],
    perPage: 9,
    orderBy: 'name',
    order: 'asc',
    hideEmpty: true,
    nameLike: '',
};

const getTermLabel = (term?: Term): string =>
    term?.name || __('Untitled', 'frontenda-blocks');

export default function TermsEditor({ terms: rawTerms, setAttributes }: Props) {
    const terms = { ...DEFAULT_TERMS, ...rawTerms };
    const [search, setSearch] = useState('');
    const update = (patch: Partial<TermsSettings>) => setAttributes({
        terms: { ...terms, ...patch },
    });

    const taxonomies = useSelect((select) => {
        const records = select(store).getTaxonomies({ per_page: -1 }) as Taxonomy[] | null;

        return (records ?? []).filter((taxonomy) => taxonomy.visibility?.public !== false);
    }, []);

    const available = useSelect((select) => {
        const request: Record<string, string | number | boolean> = {
            per_page: terms.mode === 'manual' ? 100 : terms.perPage,
            orderby: terms.orderBy === 'count' ? 'count' : 'name',
            order: terms.order,
            hide_empty: terms.hideEmpty,
        };

        if (terms.mode === 'manual' && search) {
            request.search = search;
        } else if (terms.nameLike) {
            request.search = terms.nameLike;
        }

        return select(store).getEntityRecords<Term>('taxonomy', terms.taxonomy, request) ?? null;
    }, [terms.mode, terms.taxonomy, terms.perPage, terms.orderBy, terms.order, terms.hideEmpty, terms.nameLike, search]);

    const selected = useSelect((select) => {
        if (terms.termIds.length === 0) {
            return [];
        }

        return select(store).getEntityRecords<Term>('taxonomy', terms.taxonomy, {
            include: terms.termIds,
            per_page: terms.termIds.length,
        }) ?? [];
    }, [terms.taxonomy, terms.termIds.join(',')]);

    const selectedById = new Map(selected.map((term) => [term.id, term]));
    const move = (index: number, offset: number) => {
        const destination = index + offset;
        if (destination < 0 || destination >= terms.termIds.length) {
            return;
        }

        const termIds = [...terms.termIds];
        [termIds[index], termIds[destination]] = [termIds[destination]!, termIds[index]!];
        update({ termIds });
    };

    return <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <strong>{__('Term query', 'frontenda-blocks')}</strong>

        <RadioControl
            label={__('Selection mode', 'frontenda-blocks')}
            selected={terms.mode}
            options={[
                { label: __('Automatic', 'frontenda-blocks'), value: 'automatic' },
                { label: __('Manual', 'frontenda-blocks'), value: 'manual' },
            ]}
            onChange={(mode: string) => update({ mode: mode === 'manual' ? 'manual' : 'automatic' })}
        />

        <SelectControl
            label={__('Taxonomy', 'frontenda-blocks')}
            value={terms.taxonomy}
            options={taxonomies.map((taxonomy) => ({ label: taxonomy.name, value: taxonomy.slug }))}
            onChange={(taxonomy: string) => update({ taxonomy, termIds: [] })}
        />

        <ToggleControl
            label={__('Hide empty terms', 'frontenda-blocks')}
            checked={terms.hideEmpty}
            onChange={(hideEmpty: boolean) => update({ hideEmpty })}
        />

        {terms.mode === 'automatic' ? <>
            <RangeControl
                label={__('Number of terms', 'frontenda-blocks')}
                value={terms.perPage}
                min={1}
                max={96}
                onChange={(perPage?: number) => update({ perPage: perPage ?? DEFAULT_TERMS.perPage })}
            />
            <TextControl
                label={__('Name contains', 'frontenda-blocks')}
                help={__('Optional. Keeps only terms whose name contains this text.', 'frontenda-blocks')}
                value={terms.nameLike}
                onChange={(nameLike: string) => update({ nameLike })}
            />
            <SelectControl
                label={__('Order by', 'frontenda-blocks')}
                value={terms.orderBy}
                options={[
                    { label: __('Name', 'frontenda-blocks'), value: 'name' },
                    { label: __('Slug', 'frontenda-blocks'), value: 'slug' },
                    { label: __('Count', 'frontenda-blocks'), value: 'count' },
                    { label: __('Term order', 'frontenda-blocks'), value: 'term_order' },
                ]}
                onChange={(orderBy: TermsSettings['orderBy']) => update({ orderBy })}
            />
            <SelectControl
                label={__('Direction', 'frontenda-blocks')}
                value={terms.order}
                options={[
                    { label: __('Ascending', 'frontenda-blocks'), value: 'asc' },
                    { label: __('Descending', 'frontenda-blocks'), value: 'desc' },
                ]}
                onChange={(order: TermsSettings['order']) => update({ order })}
            />
        </> : <>
            <ComboboxControl
                label={__('Add terms', 'frontenda-blocks')}
                value={null}
                options={(available ?? [])
                    .filter((term) => !terms.termIds.includes(term.id))
                    .map((term) => ({ label: getTermLabel(term), value: String(term.id) }))}
                onFilterValueChange={setSearch}
                onChange={(value: string | null | undefined) => {
                    const termId = Number(value);
                    if (termId > 0 && !terms.termIds.includes(termId)) {
                        update({ termIds: [...terms.termIds, termId] });
                    }
                }}
            />
            <div className="grid gap-2">
                {terms.termIds.map((termId, index) => <div
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2"
                    key={termId}
                >
                    <span className="min-w-0 flex-1 truncate">
                        {getTermLabel(selectedById.get(termId))}
                    </span>
                    <Button icon="arrow-up-alt2" label={__('Move up', 'frontenda-blocks')} disabled={index === 0} onClick={() => move(index, -1)} />
                    <Button icon="arrow-down-alt2" label={__('Move down', 'frontenda-blocks')} disabled={index === terms.termIds.length - 1} onClick={() => move(index, 1)} />
                    <Button icon="no-alt" label={__('Remove', 'frontenda-blocks')} isDestructive onClick={() => update({
                        termIds: terms.termIds.filter((id) => id !== termId),
                    })} />
                </div>)}
            </div>
        </>}

        {available === null ? <Spinner /> : <div className="text-sm text-neutral-500">
            {terms.mode === 'automatic'
                ? __('The query currently returns %d terms.', 'frontenda-blocks').replace('%d', String(available.length))
                : __('Selected terms: %d', 'frontenda-blocks').replace('%d', String(terms.termIds.length))}
        </div>}
    </div>;
}
