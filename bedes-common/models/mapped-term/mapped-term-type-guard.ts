import { IBedesAtomicTermMap } from './bedes-atomic-term-map.interface';
import { IBedesCompositeTermMap } from './bedes-composite-term-map.interface';

/**
 * Determines if an object confirms to the IBedesCompositeTermMap interface.
 */
export function isBedesCompositeTermMap(item: IBedesAtomicTermMap | IBedesCompositeTermMap): item is IBedesCompositeTermMap {
    return (<IBedesCompositeTermMap>item)._compositeTermId !== undefined;
}

/**
 * Determines if an object confirms to the IBedesAtomicTermMap interface.
 */
export function isBedesAtomicTermMap(item: IBedesAtomicTermMap | IBedesCompositeTermMap): item is IBedesAtomicTermMap {
    return (<IBedesAtomicTermMap>item)._bedesTermId !== undefined;
}