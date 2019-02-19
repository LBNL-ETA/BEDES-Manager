/**
 * Defines the mappings between an AppTerm and a BedesCompositeTerm.
 */
export interface ITermMappingComposite {
    _id?: number | null | undefined;
    _appListOptionUUID?: string | null | undefined;
    _bedesName: string;
    _compositeTermUUID: string;
}