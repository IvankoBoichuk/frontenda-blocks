import { wp } from '@/editor/wp';
import type { FocalPoint } from '@/editor/types';

const { createElement } = wp.element;
const { FocalPointPicker } = wp.components;

type Props = {
    url: string;
    focalPoint: FocalPoint;
    zoom: number;
    onChange: (value: FocalPoint) => void;
};

export default function ZoomableFocalPointPicker({
    url,
    focalPoint,
    zoom,
    onChange,
}: Props) {
    return (
        <div
            className="components-focal-point-picker-wrapper"
            style={{
                ['--fa-focal-point-x' as any]: `${focalPoint.x * 100}%`,
                ['--fa-focal-point-y' as any]: `${focalPoint.y * 100}%`,
                ['--fa-focal-point-zoom' as any]: zoom,
            }}
        >
            <FocalPointPicker
                url={url}
                value={focalPoint}
                onChange={onChange}
                onDrag={onChange}
            />
        </div>
    );
}
