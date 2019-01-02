import { SearchResultType } from './search-result-type.enum';
import { IBedesSearchResult } from './bedes-search-result.interface';

export class BedesSearchResult {
    private _id: number;
    private _uuid: string;
    private _name: string;
    private _description: string;
    private _resultObjectType: SearchResultType;
    private _dataTypeId: number;
    private _unitId: number;
    private _termCategoryId: number;

    constructor(data?: IBedesSearchResult) {
        if (data) {
            this._id = data._id;
            this._uuid = data._uuid;
            this._name = data._name;
            this._description = data._description;
            this._resultObjectType = data._resultObjectType;
            this._dataTypeId = data._dataTypeId;
            this._unitId = data._unitId;
            this._termCategoryId = data._termCategoryId;
        }
    }

    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
    }
    get uuid(): string {
        return this._uuid;
    }
    set uuid(value: string) {
        this._uuid = value;
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
    get resultObjectType(): SearchResultType {
        return this._resultObjectType;
    }
    set resultObjectType(value: SearchResultType) {
        this._resultObjectType = value;
    }
    get dataTypeId(): number {
        return this._dataTypeId;
    }
    set dataTypeId(value: number) {
        this._dataTypeId = value;
    }
    get unitId(): number {
        return this._unitId;
    }
    set unitId(value: number) {
        this._unitId = value;
    }
    get termCategoryId(): number {
        return this._termCategoryId;
    }
    set termCategoryId(value: number) {
        this._termCategoryId = value;
    }
}