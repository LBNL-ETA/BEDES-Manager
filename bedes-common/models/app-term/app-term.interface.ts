import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";
import { TermType } from '../../enums/term-type.enum';

export interface IAppTerm {
    _id?: number | null | undefined;
    _fieldCode?: string | null | undefined;
    _name: string;
    _termTypeId: TermType;
    _description?: string | null | undefined;
    _additionalInfo?: Array<IAppTermAdditionalInfo>;
    _uuid?: string | null | undefined;
    _unitId?: number | null | undefined;
}
