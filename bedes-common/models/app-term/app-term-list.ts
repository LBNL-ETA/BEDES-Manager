import { AppTerm } from './app-term';
import { AppTermListOption } from './app-term-list-option';
import { IAppTermList } from './app-term-list.interface';
import { IAppTermListOption } from '.';

/**
 * A constrained list is an AppTerm with
 * an array of ListOptions linked to it.
 */
export class AppTermList extends AppTerm {
    // holds the array of list options for the term
    protected _listOptions: Array<AppTermListOption>;

    constructor(data: IAppTermList) {
        // build the appTerm portion of the object.
        super(data);
        // build the list options
        this._listOptions = new Array<AppTermListOption>();
        if (data && Array.isArray(data._listOptions) && data._listOptions.length) {
            this.loadOptions(data._listOptions);
        }
    }

    get listOptions(): Array<AppTermListOption> {
        return this._listOptions;
    }

    private loadOptions(options: Array<IAppTermListOption>) {
        options.map((d) => this._listOptions.push(new AppTermListOption(d)));
    }

}