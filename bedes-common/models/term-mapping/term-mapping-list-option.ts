import { ITermMappingListOption } from './term-mapping-list-option.interface';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';

export class TermMappingListOption {
    // listOption
    private _listOption: BedesTermOption | null | undefined;
    get listOption(): BedesTermOption | null | undefined {
        return this._listOption;
    }
    set listOption(value: BedesTermOption | null | undefined) {
        this._listOption = value;
    }

    constructor(data?: ITermMappingListOption) {
        if (data && data._listOption) {
            this._listOption = new BedesTermOption(data._listOption);
        }
    }

    isValid(): boolean {
        return this._listOption ? true : false;
    }

    public toInterface(): ITermMappingListOption {
        return <ITermMappingListOption>{
            _listOption: this._listOption ? this._listOption.toInterface() : undefined
        };
    }
}