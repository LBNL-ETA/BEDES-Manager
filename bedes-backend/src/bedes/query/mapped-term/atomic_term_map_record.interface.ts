/**
 * Defines the object structure returned from queries on the
 * public.atomic_term_maps table.
 */
export interface IAtomicTermMapRecord {
    /** The primary key */
    _id: number;
    /** The id of the mapped BedesTerm. */
    _bedesTermUUID: string;
    /** The UUID of the mapped BedesTermOption */
    _bedesListOptionUUID: string | null;
    /** The id of the mapped AppTerm */
    _appTermId: number;
    /** The uuid of the mapped AppTermListOption */
    _appListOptionUUID: string | null;
}
