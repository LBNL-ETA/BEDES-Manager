import { AppTermListOption } from '../app-term/app-term-list-option';
import { IAppTermListOption } from '../app-term/app-term-list-option.interface';
import { IBedesCompositeTerm } from '../bedes-composite-term/bedes-composite-term.interface';

export interface ITermMappingComposite {
    _id: number | null | undefined;
    _appListOption: IAppTermListOption | null | undefined;
    _compositeTerm: IBedesCompositeTerm | null | undefined;
}
