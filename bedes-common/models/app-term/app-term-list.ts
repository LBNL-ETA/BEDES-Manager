import { AppTerm } from './app-term';
import { AppTermListOption } from './app-term-list-option';
import { IAppTermList } from './app-term-list.interface';
import { IAppTermListOption } from './app-term-list-option.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { BedesCompositeTerm } from '../bedes-composite-term/bedes-composite-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { BedesError } from '../../bedes-error/bedes-error';
import { HttpStatusCodes } from '../../enums/http-status-codes';

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

    /**
     * Maps a BedesTerm | BedesConstrainedList | BedescompositeTerm object
     * to the AppTermList instance.
     * @param bedesTerm The BedesTerm being mapped to the AppTerm instance.
     * @param [appListOption] The optional AppTermListOption to map. 
     */
    public map(
        bedesTerm: BedesTerm | BedesConstrainedList  | BedesCompositeTerm,
        bedesTermOption?: BedesTermOption | undefined,
        appListOption?: AppTermListOption | undefined
    ): void {
        super.map(bedesTerm, bedesTermOption);
        if (this._mapping && appListOption) {
            this._mapping.appListOptionUUID = appListOption.uuid;
        }
        // else {
        //     throw new BedesError(
        //         'System error mapping terms.',
        //         HttpStatusCodes.ServerError_500,
        //         'System error mapping terms.'
        //     );
        // }
    }

    /**
     * Return the object attributes as a JavaScript Object conforming to IAppTermList.
     * @returns The object instance attribute values as a JavaScript Object.
     */
    public toInterface(): IAppTermList {
        let results = <IAppTermList>(super.toInterface());
        results._listOptions = this._listOptions.map((d) => d.toInterface());
        return results;
        // return <IAppTermList>{
        //     _id: this._id,
        //     _fieldCode: this._fieldCode,
        //     _name: this._name,
        //     _description: this._description,
        //     _termTypeId: this._termTypeId,
        //     _additionalInfo: this._additionalInfo.map((d) => d.toInterface()),
        //     _uuid: this._uuid,
        //     _unitId: this._unitId,
        //     _listOptions: this._listOptions.map((d) => d.toInterface()),
        //     _mapping: this._mapping ? this._mapping.toInterface() : undefined
        // }
    }

}