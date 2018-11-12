import { IBedesTermCategory } from "./bedes-term-category.interface";

export class BedesTermCategory {
    private _id: number | null | undefined;
    private _name: string;

    constructor(data: IBedesTermCategory) {
        this._id = data._id;
        this._name = data._name;
    }
    
    public get id(): number | null | undefined {
        return this._id;
    }
    public set id(value: number | null | undefined) {
        this._id = value;
    }
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    
}