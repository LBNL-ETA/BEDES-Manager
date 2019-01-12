import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";
import { IAppTerm } from './app-term.interface';
import { IAppTermListOption } from "./app-term-list-option.interface";

export interface IAppTermList extends IAppTerm {
    _id: number | null | undefined;
    _appId: number;
    _fieldCode: string;
    _name: string;
    _description: string | null | undefined;
    _additionalInfo: Array<IAppTermAdditionalInfo>;
    _listOptions: Array<IAppTermListOption>;
}
