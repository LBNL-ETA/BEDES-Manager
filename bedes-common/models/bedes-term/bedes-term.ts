import { IBedesTerm } from "./bedes-term.interface";

export class BedesTerm {
    protected _id: number | null | undefined;
    protected _termCategoryId: number;
    protected _name: string;
    protected _description: string;
    protected _dataTypeId: number;
    protected _unitId: number | null | undefined;
    protected _definitionSourceId: number | null | undefined;
    protected _uuid: string | null | undefined;
    protected _url: string | null | undefined;

    constructor(data: IBedesTerm) {
        this._id = data._id;
        this._termCategoryId = data._termCategoryId;
        this._name = data._name;
        this._description = data._description;
        this._dataTypeId = data._dataTypeId;
        this._unitId = data._unitId;
        this._definitionSourceId = data._definitionSourceId;
        this._uuid = data._uuid;
        this._url = data._url;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get termCategoryId(): number {
        return this._termCategoryId;
    }
    set termCategoryId(value: number) {
        this._termCategoryId = value;
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
    get uuid(): string | null | undefined {
        return this._uuid;
    }
    set uuid(value: string | null | undefined) {
        this._uuid = value;
    }
    get url(): string | null | undefined {
        return this._url;
    }
    set url(value: string | null | undefined) {
        this._url = value;
    }

    /**
     * Build the interface data from this object.
     * @returns interface 
     */
    public toInterface(): IBedesTerm {
        return <IBedesTerm>{
            _id: this._id,
            _name: this._name,
            _description: this._description,
            _dataTypeId: this._dataTypeId,
            _definitionSourceId: this._definitionSourceId,
            _termCategoryId: this._termCategoryId,
            _unitId: this._unitId,
            _uuid: this._uuid,
            _url: this._url
        }
    }
}