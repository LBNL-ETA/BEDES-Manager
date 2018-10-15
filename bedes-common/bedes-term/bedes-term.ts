import { IBedesTerm } from "./bedes-term.interface";

export class BedesTerm {
    protected _id: number | null | undefined;
    protected _termTypeId: number;
    protected _name: string;
    protected _description: string;
    protected _dataTypeId: number;
    protected _unitId: number | null | undefined;
    protected _definitionSourceId: number | null | undefined;

    constructor(data: IBedesTerm) {
        this._id = data._id;
        this._termTypeId = data._termTypeId;
        this._name = data._name;
        this._description = data._description;
        this._dataTypeId = data._dataTypeId;
        this._unitId = data._unitId;
        this._definitionSourceId = data._definitionSourceId;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get termTypeId(): number {
        return this._termTypeId;
    }
    set termTypeId(value: number) {
        this._termTypeId = value;
    }
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    get description(): string {
        return this._description;
    }
    set description(value: string) {
        this._description = value;
    }
    get dataTypeId(): number {
        return this._dataTypeId;
    }
    set dataTypeId(value: number) {
        this._dataTypeId = value;
    }
    get unitId(): number | null | undefined {
        return this._unitId;
    }
    set unitId(value: number | null | undefined) {
        this._unitId = value;
    }
    get definitionSourceId(): number | null | undefined {
        return this._definitionSourceId;
    }
    set definitionSourceId(value: number | null | undefined) {
        this._definitionSourceId = value;
    }
}