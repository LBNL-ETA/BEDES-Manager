import { AppTermAdditionalInfo } from "./app-term-additional-info";
import { IAppTerm } from "./app-term.interface";
import { TermType } from '../../enums/term-type.enum';
import { IAppTermAdditionalInfo } from './app-term-additional-info.interface';

export class AppTerm {
    protected _id: number | null | undefined;
    protected _fieldCode: string;
    protected _name: string;
    protected _description: string | null | undefined;
    protected _termTypeId: TermType;
    protected _additionalInfo: Array<AppTermAdditionalInfo>;
    protected _uuid: string | null | undefined;
    protected _unitId: number | null | undefined;

    constructor(data: IAppTerm) {
        this._id = data._id;
        this._fieldCode = data._fieldCode;
        this._name = data._name;
        this._description = data._description;
        this._termTypeId = data._termTypeId;
        this._additionalInfo = new Array<AppTermAdditionalInfo>();
        if (data._additionalInfo && data._additionalInfo.length) {
            data._additionalInfo.map(
                (item: IAppTermAdditionalInfo) => this._additionalInfo.push(new AppTermAdditionalInfo(item))
            );
        }
        this._uuid = data._uuid || undefined;
        this._unitId = data._unitId;
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
    get termTypeId(): TermType {
        return this._termTypeId;
    }
    set termTypeId(value: TermType) {
        this._termTypeId = value;
    }
    get additionalInfo(): Array<AppTermAdditionalInfo> {
        return this._additionalInfo;
    }
    set additionalInfo(value: Array<AppTermAdditionalInfo>) {
        this._additionalInfo = value;
    }
    get uuid(): string | null | undefined {
        return this._uuid;
    }
    get unitId(): number | null | undefined {
        return this._unitId;
    }
    set unitId(value: number | null | undefined) {
        this._unitId = value;
    }

    private validate(): void {
        if (!this._name || typeof this.name !== 'string' || !this._name.trim()) {
            throw new Error(`${this.constructor.name}: No field name present.`);
        }
    }
}
