import { IAppTermMap, IBedesTermMap } from '../mapped-term';

export interface IMappedTerm {
    _id: number | null | undefined;
    _appId: number;
    _appTerms: Array<IAppTermMap>;
    _bedesTerms: Array<IBedesTermMap>;
}