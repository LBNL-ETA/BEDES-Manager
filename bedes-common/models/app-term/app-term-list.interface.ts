import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";
import { IAppTerm } from './app-term.interface';
import { IAppTermListOption } from "./app-term-list-option.interface";
import { TermType } from '../../enums/term-type.enum';

export interface IAppTermList extends IAppTerm {
    _id?: number | null | undefined;
    _fieldCode?: string | null | undefined;
    _name: string;
    _termTypeId: TermType;
    _dataTypeId: number | null | undefined;
    _description?: string | null | undefined;
    _additionalInfo?: Array<IAppTermAdditionalInfo>;
    _uuid?: string | null | undefined;
    _unit?: string | null | undefined;
    _listOptions?: Array<IAppTermListOption>;
}
