import { ITermMappingAtomic } from './term-mapping-atomic.interface';
import { AppTermListOption } from '../app-term/app-term-list-option';
import { BedesTerm } from '../bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';

export class TermMappingAtomic {
    private _id: number | null | undefined;
    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    private _appListOption: AppTermListOption | null | undefined;
    get appListOption(): AppTermListOption | null | undefined {
        return this._appListOption;
    }
    set appListOption(value: AppTermListOption | null | undefined) {
        this._appListOption = value;
    }
    private _bedesTerm: BedesTerm | null | undefined;
    get bedesTerm(): BedesTerm | null | undefined {
        return this._bedesTerm;
    }
    set bedesTerm(value: BedesTerm | null | undefined) {
        this._bedesTerm = value;
    }
    private _bedesListOption: BedesTermOption | null | undefined;
    get bedesListOption(): BedesTermOption | null | undefined {
        return this._bedesListOption;
    }
    set bedesListOption(value: BedesTermOption | null | undefined) {
        this._bedesListOption = value;
    }
    
    constructor(data?: ITermMappingAtomic) {
        if (data) {
            this._id = data._id;
            this._appListOption = data._appListOption ? new AppTermListOption(data._appListOption) : undefined;
            this._bedesTerm = data._bedesTerm ? new BedesTerm(data._bedesTerm) : undefined;
            this._bedesListOption = data._bedesListOption ? new BedesTermOption(data._bedesListOption) : undefined;
        }
    }

    public toInterface(): ITermMappingAtomic {
        return <ITermMappingAtomic>{
            _id: this._id,
            _appListOption: this._appListOption ? this._appListOption.toInterface() : undefined,
            _bedesListOption: this._bedesListOption ? this._bedesListOption.toInterface() : undefined,
            _bedesTerm: this._bedesTerm ? this._bedesTerm.toInterface() : undefined
        }
    }

}

