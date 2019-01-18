import { AppTerm } from './app-term';
import { AppTermListOption } from './app-term-list-option';
import { IAppTermList } from './app-term-list.interface';
import { IAppTermListOption } from './app-term-list-option.interface';

/**
 * A constrained list is an AppTerm with
 * an array of ListOptions linked to it.
 */
export class AppTermList extends AppTerm {
    // holds the array of list options for the term
    protected _listOptions: Array<AppTermListOption>;
    get listOptions(): Array<AppTermListOption> {
        return this._listOptions;
    }
    set listOptions(value: Array<AppTermListOption>) {
        this._listOptions = value;
    }

    constructor(data: IAppTermList) {
        // build the appTerm portion of the object.
        super(data);
        // build the list options
        this._listOptions = new Array<AppTermListOption>();
        if (data && Array.isArray(data._listOptions) && data._listOptions.length) {
            this.loadOptions(data._listOptions);
        }
    }

    private loadOptions(options: Array<IAppTermListOption>) {
        options.map((d) => this._listOptions.push(new AppTermListOption(d)));
    }

    public toInterface(): IAppTermList {
        const termInterface = super.toInterface();
        console.log('super interface', termInterface);
        return <IAppTermList>{
            _id: this._id,
            _fieldCode: this._fieldCode,
            _name: this._name,
            _description: this._description,
            _termTypeId: this._termTypeId,
            _additionalInfo: this._additionalInfo.map((d) => d.toInterface()),
            _uuid: this._uuid,
            _unitId: this._unitId,
            _listOptions: this._listOptions.map((d) => d.toInterface())
        }
    }

}