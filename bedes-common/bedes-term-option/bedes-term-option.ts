import { IBedesTermOption } from "./bedes-term-option.interface";

export class BedesTermOption {
    private _id: number | null | undefined;
    private _name: string;
    private _description: string;
    protected _unitId: number | null | undefined;
    private _definitionSource: string | null | undefined;

    constructor(data: IBedesTermOption) {
        this._id = data._id;
        this._name = data._name;
        this._description = data._description;
        this._unitId = data._unitId;
        this._definitionSource = data._definitionSource;
    }
    
    public get id() : number | null | undefined {
        return this._id;
    }
    public set id(value: number | null | undefined) {
        this._id = value;
    }
    public get name() : string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    public get description() : string {
        return this._description;
    }
    public set description(value: string) {
        this._description = value;
    }
    get unitId(): number | null | undefined {
        return this._unitId;
    }
    set unitId(value: number | null | undefined) {
        this._unitId = value;
    }
    public get definitionSource() : string | null | undefined {
        return this._definitionSource;
    }
    public set definitionSource(value: string | null | undefined) {
        this._definitionSource = value;
    }
    
}