import { IBedesTermOption } from "./bedes-term-option.interface";

export class BedesTermOption {
    private _id: number | null | undefined;
    private _name: string;
    private _description: string;
    protected _unitId: number | null | undefined;
    private _definitionSourceId: number | null | undefined;
    protected _uuid: string | null | undefined;
    protected _url: string | null | undefined;

    constructor(data: IBedesTermOption) {
        this._id = data._id;
        this._name = data._name;
        this._description = data._description;
        this._unitId = data._unitId;
        this._definitionSourceId = data._definitionSourceId;
        this._uuid = data._uuid;
        this._url = data._url;
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
    public get definitionSourceId() : number | null | undefined {
        return this._definitionSourceId;
    }
    public set definitionSourceId(value: number | null | undefined) {
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
    
    public toInterface(): IBedesTermOption {
        return <IBedesTermOption>{
            _id: this._id,
            _name: this._name,
            _description: this._description,
            _unitId: this._unitId,
            _definitionSourceId: this._definitionSourceId,
            _uuid: this._uuid,
            _url: this._url,
        };
    }
}