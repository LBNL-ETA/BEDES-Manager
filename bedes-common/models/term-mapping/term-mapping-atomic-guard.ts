import { ITermMappingAtomic } from './term-mapping-atomic.interface';
import { ITermMappingComposite } from './term-mapping-composite.interface';

/**
 * Determines whether if an object conforms to the ITermMappingAtomic interface.
 * @param item The object in question.
 * @returns boolean indicating if the item obect is an ITermMappingAtomic object.
 */
export function isITermMappingAtomic(
    item: ITermMappingAtomic | ITermMappingComposite
): item is ITermMappingAtomic {
    return (<ITermMappingAtomic>item)._bedesTermUUID !== undefined;
}
