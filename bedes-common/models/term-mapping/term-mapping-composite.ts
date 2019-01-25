import { ITermMappingComposite } from './term-mapping-composite.interface';
import { AppTermListOption } from '../app-term/app-term-list-option';
import { BedesCompositeTerm } from '../bedes-composite-term/bedes-composite-term';

export class TermMappingComposite {
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
    private _compositeTerm: BedesCompositeTerm | null | undefined;
    get compositeTerm(): BedesCompositeTerm | null | undefined {
        return this._compositeTerm;
    }
    set compositeTerm(value: BedesCompositeTerm | null | undefined) {
        this._compositeTerm = value;
    }
    
    constructor(data: ITermMappingComposite) {
        this._id = data._id;
        this._appListOption = new AppTermListOption(data._appListOption);
        this._compositeTerm = new BedesCompositeTerm(data._compositeTerm);
    }

    public toInterface(): ITermMappingComposite {
        return <ITermMappingComposite>{
            _id: this._id,
            _appListOption: this._appListOption ? this._appListOption.toInterface() : undefined,
            _compositeTerm: this._compositeTerm ? this._compositeTerm.toInterface() : undefined,
        }
    }

}
