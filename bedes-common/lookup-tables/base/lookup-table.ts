import { LookupTableItem } from "./lookup-table-item";
import { ILookupTableItem } from "./lookup-table-item.interface";

export class LookupTable {
    // holds the objects belonging to the table
    protected _items: Array<LookupTableItem>;

    constructor(data?: Array<ILookupTableItem>) {
        this._items = new Array<LookupTableItem>();
        if (data) {
            data.map((d) => this.addItem(new LookupTableItem(d)));
        }
    }

    public addItem(item: LookupTableItem) {
        // if the list should check for uniqueness
        // then throw an error if an item already exists
        if (this.itemExists(item)) {
            throw new Error(`ID for item (${item.id}) already exists`);
        }
        else {
            this._items.push(item);
        }
    }

    private itemExists(item: LookupTableItem): boolean {
        return this._items.find((d) => d.id === item.id) ? true : false;
    }

    public getItemById(id: number): LookupTableItem {
        return this._items.find((d) => d.id === id);
    }
}