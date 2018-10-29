import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";

export class AppTermAdditionalInfo {
    private _id: number | null | undefined;
    private _appFieldId: number;
    private _value: string | null | undefined;

    constructor(data: IAppTermAdditionalInfo) {
        this._id = data._id;
        this._appFieldId = data._appFieldId;
        this._value = data._value;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get appFieldId(): number {
        return this._appFieldId;
    }
    set appFieldId(value: number) {
        this._appFieldId = value;
    }
    get value(): string | null | undefined {
        return this._value;
    }
    set value(value: string | null | undefined) {
        this._value = value;
    }
}
