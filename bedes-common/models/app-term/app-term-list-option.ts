import { IAppTermListOption } from './app-term-list-option.interface';

export class AppTermListOption {
    private _id: number | null | undefined;
    private _name: string;
    private _unitId: number | null | undefined;

    constructor(data: IAppTermListOption) {
        this._id = data._id;
        this._name = data._name;
        this._unitId = data._unitId;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined ) {
        this._id = value;
    }
    get name(): string{
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    get unitId(): number | null | undefined {
        return this._unitId;
    }
    set unitId(value: number | null | undefined ) {
        this._unitId = value;
    }

    /**
     * Transforms the object to an IAppTermadditionalInfo object.
     */
    public toInterface(): IAppTermListOption {
        return <IAppTermListOption>{
            _id: this._id,
            _name: this._name,
            _unitId: this._unitId
        };
    }
}