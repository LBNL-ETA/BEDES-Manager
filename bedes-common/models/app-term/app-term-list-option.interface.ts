import { ITermMappingListOption } from "../term-mapping/term-mapping-list-option.interface";

/**
 * Defines the data attributes for a given AppTermListOption.
 */
export interface IAppTermListOption {
    _id?: number | null | undefined;
    _name: string;
    _description?: string | null | undefined;
    _unitId?: number | null | undefined;
    _mapping?: ITermMappingListOption | null | undefined;
}