import { IAppTermMap } from '../mapped-term';
import { IBedesAtomicTermMap } from './bedes-atomic-term-map.interface';
import { IBedesCompositeTermMap } from './bedes-composite-term-map.interface';

/**
 * Represents the mapping between an applications term(s) and Bedes terms.
 */
export interface IMappedTerm {
    _id?: number | null | undefined;
    _appId: number;
    _appTerms: Array<IAppTermMap>;
    _bedesTerm: IBedesAtomicTermMap | IBedesCompositeTermMap
}