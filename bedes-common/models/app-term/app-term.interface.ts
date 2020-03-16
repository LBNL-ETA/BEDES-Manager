import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";
import { TermType } from '../../enums/term-type.enum';
import { ITermMappingAtomic } from '../term-mapping/term-mapping-atomic.interface';
import { ITermMappingComposite } from '../term-mapping/term-mapping-composite.interface';

export interface IAppTerm {
    _id?: number | null | undefined;
    _fieldCode?: string | null | undefined;
    _name: string;
    _termTypeId: TermType;
    _description?: string | null | undefined;
    _additionalInfo?: Array<IAppTermAdditionalInfo>;
    _uuid?: string | null | undefined;
    _unit?: string | null | undefined;
    _mapping?: ITermMappingAtomic | ITermMappingComposite | null | undefined;
}
