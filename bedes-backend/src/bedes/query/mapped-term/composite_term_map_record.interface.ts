/**
 * Defines the object structure returned from queries on the
 * public.composite_term_maps table.
 */
export interface ICompositeTermMapRecord {
    /** The primary key */
    _id: number;
    /** The id of the mapped BedesCompositeTerm */
    _bedesCompositeTermId: number | null;
    /** The id of the mapped AppTerm */
    _appTermId: number;
    /** The id of the mapped AppTermListOption */
    _appListOptionId: number | null;
}
