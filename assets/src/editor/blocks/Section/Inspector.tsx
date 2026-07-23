import { wp } from '@/editor/wp';

import type { SectionEditProps } from '../../types';
import Media from '../../panels/Media';
import Title from '../../panels/Title';
import Subtitle from '../../panels/Subtitle';
import Query from '../../panels/Query';
import Swiper from '../../panels/Swiper';
import Settings from '../../panels/Settings';
import { ListSettings } from '../../panels/List';

const { createElement } = wp.element;
const { InspectorControls } = wp.blockEditor;

export default function Inspector({
    setAttributes,
    attributes,
} : SectionEditProps) {
    const {allowedElements = []} = attributes;
    return (
        <InspectorControls>
            <Settings setAttributes={setAttributes} attributes={attributes} />
            {allowedElements.includes('subttl') && <Subtitle setAttributes={setAttributes} attributes={attributes} />}
            {allowedElements.includes('ttl') && <Title setAttributes={setAttributes} attributes={attributes} />}
            {allowedElements.includes('media') && <Media setAttributes={setAttributes} attributes={attributes} />}
            {allowedElements.includes('query') && <Query setAttributes={setAttributes} attributes={attributes} />}
            {(allowedElements.includes('query') || attributes.media?.type === 'gallery') && <Swiper setAttributes={setAttributes} attributes={attributes} />}
            {allowedElements.includes('list') && <ListSettings setAttributes={setAttributes} attributes={attributes} list={attributes.list} layouts={attributes.layouts} />}
            {/* buttons */}
        </InspectorControls>
    );
}
