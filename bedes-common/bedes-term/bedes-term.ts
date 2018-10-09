import { IBedesTerm } from "./bedes-term.interface";

export class BedesTerm {
    private _id: number | null | undefined;
    private _termTypeId: number;
    private _name: string;
    private _description: string;
    private _dataTypeId: number;
    private _unitOfMeasureId: number | null | undefined;
    private _definitionSourceId: number | null | undefined;

    constructor(data: IBedesTerm) {
        this._id = data._id;
        this._termTypeId = data._termTypeId;
        this._name = data._name;
        this._description = data._description;
        this._dataTypeId = data._dataTypeId;
        this._unitOfMeasureId = data._unitOfMeasureId;
        this._definitionSourceId = data._definitionSourceId;
    }
}