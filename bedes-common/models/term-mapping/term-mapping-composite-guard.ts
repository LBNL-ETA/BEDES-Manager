import { ITermMappingAtomic } from './term-mapping-atomic.interface';
import { ITermMappingComposite } from './term-mapping-composite.interface';

/**
 * Determines whether if an object conforms to the ITermMappingComposite interface.
 * @param item The object in question.
 * @returns boolean indicating if the item obect is an ITermMappingComposite object.
 */
export function isITermMappingComposite(
    item: ITermMappingAtomic | ITermMappingComposite
): item is ITermMappingAtomic {
    return (<ITermMappingComposite>item)._compositeTermUUID !== undefined;
}
