import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";
import { TermType } from '../../enums/term-type.enum';
import { ITermMappingAtomic } from '../term-mapping/term-mapping-atomic.interface';
import { ITermMappingComposite } from '../term-mapping/term-mapping-composite.interface';

export interface IAppTerm {
    _id?: number | null | undefined;
    _appId?: number | null | undefined;
    _fieldCode?: string | null | undefined;
    _name: string;
    _termTypeId: TermType;
    _dataTypeId: number | null | undefined;
    _description?: string | null | undefined;
    _additionalInfo?: Array<IAppTermAdditionalInfo>;
    _uuid?: string | null | undefined;
    _unit?: string | null | undefined;
    _mapping?: ITermMappingAtomic | ITermMappingComposite | null | undefined;
    _applicationName?: string | null | undefined;
    _applicationOwner?: string | null | undefined;
    _applicationScopeId?: number | null | undefined;
}
