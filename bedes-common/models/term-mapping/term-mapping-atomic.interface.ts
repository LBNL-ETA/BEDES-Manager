import { TermType } from '../../enums/term-type.enum';

/**
 * The object structure that defines the mapping between an
 * AppTerm and an atomic BedesTerm.
 */
export interface ITermMappingAtomic {
    /** The id of the object record */
    _id?: number | null | undefined;
    /** The AppTermListOption in the mapping */
    _appListOptionUUID?: string | null | undefined;
    /** The TermType of the mapped BedesTerm */
    _bedesTermType: TermType;
    /** The uuid of the mapped BedesTerm */
    _bedesTermUUID: string;
    /** The uuid of the mapped BedesTermOption */
    _bedesListOptionUUID?: string | null | undefined;
    /** The name of the mapping */
    _bedesName: string;
}
