import { BedesTerm } from "./bedes-term";
import { IBedesConstrainedList } from "./bedes-constrained-list.interface";
import { BedesTermOption } from "../bedes-term-option/bedes-term-option";
import { IBedesTermOption } from "../bedes-term-option/bedes-term-option.interface";

export class BedesConstrainedList extends BedesTerm {
    private _options: Array<BedesTermOption>;
    constructor(data: IBedesConstrainedList) {
        super(data);
        this._options = new Array<BedesTermOption>();
        if (data._options && data._options.length) {
            this.loadOptions(data._options);
        }
    }

    /**
     * Returns the array of Term Options
     */
    get options(): Array<BedesTermOption> {
        return this._options;
    }
    /**
     * Loads the options for the BedesTermConstrainedList.
     * @param options 
     */
    public loadOptions(options: Array<IBedesTermOption>): void {
        options.map((d) => this._options.push(new BedesTermOption(d)));
    }

    /**
     * Adds BedesTermOption to the Constrained List.
     * @param option 
     */
    public async addOption(termOption: BedesTermOption): Promise<void> {
        this._options.push(termOption);
    }

    public toInterface(): IBedesConstrainedList {
        let iterm = super.toInterface();
        return <IBedesConstrainedList>{
            ...iterm,
            _options: this._options.map((d) => d.toInterface())
        }
    }
}
