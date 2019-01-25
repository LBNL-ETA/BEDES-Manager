import { IAppTermListOption } from '../app-term/app-term-list-option.interface';
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { IBedesTermOption } from '../bedes-term-option/bedes-term-option.interface';

export interface ITermMappingAtomic {
    _id?: number | null | undefined;
    _appListOption?: IAppTermListOption | null | undefined;
    _bedesTerm?: IBedesTerm | null | null | undefined;
    _bedesListOption?: IBedesTermOption | null | undefined;
}
