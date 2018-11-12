import { AppTermAdditionalInfo } from "./app-term-additional-info";
import { IAppTerm } from "./app-term.interface";

export class AppTerm {
    private _id: number | null | undefined;
    private _appId: number;
    private _fieldCode: string;
    private _name: string;
    private _description: string | null | undefined;
    private _additionalInfo: Array<AppTermAdditionalInfo>;

    constructor(data: IAppTerm) {
        this._id = data._id;
        this._appId = data._appId;
        this._fieldCode = data._fieldCode;
        this._name = data._name;
        this._description = data._description;
        this._additionalInfo = new Array<AppTermAdditionalInfo>();
        if (data._additionalInfo && data._additionalInfo.length) {
            data._additionalInfo.map((d) => this._additionalInfo.push(new AppTermAdditionalInfo(d)));
        }
        this.validate();
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get fieldCode(): string {
        return this._fieldCode;
    }
    set fieldCode(value: string) {
        this._fieldCode = value;
    }
    get appId(): number {
        return this._appId;
    }
    set appId(value: number) {
        this._appId = value;
    }
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    get description(): string | null | undefined {
        return this._description;
    }
    set description(value: string | null | undefined) {
        this._description = value;
    }
    get additionalInfo(): Array<AppTermAdditionalInfo> {
        return this._additionalInfo;
    }
    set additionalInfo(value: Array<AppTermAdditionalInfo>) {
        this._additionalInfo = value;
    }

    private validate(): void {
        if (!this._name || typeof this.name !== 'string' || !this._name.trim()) {
            throw new Error(`${this.constructor.name}: No field name present.`);
        }
    }
}
