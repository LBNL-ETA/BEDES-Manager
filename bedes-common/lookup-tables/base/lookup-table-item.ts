import { ILookupTableItem } from "./lookup-table-item.interface";

export class LookupTableItem {
    private _id: number;
    private _name: string;
    private _description: string | null | undefined;

    constructor(data: ILookupTableItem) {
        this._id = data._id;;
        this._name = data._name;
        this._description = data._description;
    }
    
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }
    public get name(): string {
        return this._name;
    }
    public set description(value: string) {
        this._description = value;
    }
    public get description(): string {
        return this._description;
    }
    public set name(value: string) {
        this._name = value;
    }
}
