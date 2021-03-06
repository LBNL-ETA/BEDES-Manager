import { SearchResultType } from './search-result-type.enum';
import { IBedesSearchResult } from './bedes-search-result.interface';

export class BedesSearchResult {
    private _id: number;
    private _uuid: string;
    private _termUUID: string | null | undefined;
    private _termListName: string | null | undefined;
    private _termId: number | null | undefined;
    private _name: string;
    private _description: string;
    private _resultObjectType: SearchResultType;
    private _dataTypeId: number;
    private _unitId: number;
    private _termCategoryId: number;
    private _ownerName: string | null | undefined;
    private _scopeId: number | null | undefined;

    constructor(data?: IBedesSearchResult) {
        if (data) {
            this._id = data._id;
            this._uuid = data._uuid;
            this._termUUID = data._termUUID;
            this._termListName = data._termListName;
            this._termId = data._termId;
            this._name = data._name;
            this._description = data._description;
            this._resultObjectType = data._resultObjectType;
            this._dataTypeId = data._dataTypeId;
            this._unitId = data._unitId;
            this._termCategoryId = data._termCategoryId;
            this._ownerName = data._ownerName;
            this._scopeId = data._scopeId;
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
    get termUUID(): string {
        return this._termUUID;
    }
    set termUUID(value: string) {
        this._termUUID = value;
    }
    get termListName(): string {
        return this._termListName;
    }
    set termListName(value: string) {
        this._termListName = value;
    }
    get termId(): number {
        return this._termId;
    }
    set termId(value: number) {
        this._termId = value;
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
    get ownerName(): string | null | undefined {
        return this._ownerName;
    }
    set ownerName(value: string | null | undefined) {
        this._ownerName = value;
    }
    get scopeId(): number | null | undefined {
        return this._scopeId;
    }
    set scopeId(value: number | null | undefined) {
        this._scopeId = value;
    }
}