import { ITermMappingListOption } from "../term-mapping/term-mapping-list-option.interface";

/**
 * Defines the data attributes for a given AppTermListOption.
 */
export interface IAppTermListOption {
    /** The id of the object's record in the database. */
    _id?: number | null | undefined;
    /** The name of the list option. */
    _name: string;
    /** The uuid of the AppTermListOption */
    _uuid?: string | null | undefined;
    /** The description of the list option. */
    _description?: string | null | undefined;
    /** The unit_id of the list option. */
    _unitId?: number | null | undefined;
    /** Defines the mapping between the list option and a BedesTermListOption */
    _mapping?: ITermMappingListOption | null | undefined;
}