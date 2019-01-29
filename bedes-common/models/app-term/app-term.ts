import { AppTermAdditionalInfo } from "./app-term-additional-info";
import { IAppTerm } from "./app-term.interface";
import { TermType } from '../../enums/term-type.enum';
import { IAppTermAdditionalInfo } from './app-term-additional-info.interface';
import { IAppTermList } from ".";
import { AppTermList } from './app-term-list';
import { TermMappingAtomic } from '../term-mapping/term-mapping-atomic';
import { TermMappingComposite } from '../term-mapping/term-mapping-composite';
import { UUIDGenerator } from '../uuid-generator/uuid-generator';

export class AppTerm extends UUIDGenerator {
    protected _id: number | null | undefined;
    protected _fieldCode: string | null | undefined;
    protected _name: string;
    protected _description: string | null | undefined;
    protected _termTypeId: TermType;
    protected _additionalInfo: Array<AppTermAdditionalInfo>;
    protected _uuid: string | null | undefined;
    protected _unitId: number | null | undefined;
    protected _mapping: TermMappingAtomic | TermMappingComposite | null | undefined;

    constructor(data: IAppTerm) {
        super();
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
        // assign a uuid or generate a new one
        this._uuid = data._uuid || this.generateUUID();
        this._unitId = data._unitId;
        this.validate();
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get fieldCode(): string | null | undefined {
        return this._fieldCode;
    }
    set fieldCode(value: string | null | undefined) {
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
    get mapping(): TermMappingAtomic | TermMappingComposite | null | undefined {
        return this._mapping;
    }
    set mapping(value: TermMappingAtomic | TermMappingComposite | null | undefined) {
        this._mapping = value;
    }

    private validate(): void {
        if (!this._name || typeof this.name !== 'string' || !this._name.trim()) {
            throw new Error(`${this.constructor.name}: No field name present.`);
        }
    }

    /**
     * Return this object instance, which would be an AppTerm,
     * as an AppTermList object.
     */
    public toInterface(): IAppTerm {
        const params: IAppTerm = {
            _id: this._id,
            _fieldCode: this._fieldCode,
            _name: this._name,
            _description: this._description,
            _termTypeId: this._termTypeId,
            _uuid: this._uuid,
            _unitId: this._unitId,
            _mapping: this._mapping ? this._mapping.toInterface() : undefined
        };
        return params;
        // const newTerm = new AppTermList(params);
        // newTerm.additionalInfo = this.additionalInfo;
        // return newTerm;
    }

    /**
     * Set the mapping for this atomic term instance.
     */
    public setMapping(mapping: TermMappingAtomic | TermMappingComposite | undefined): void {
        this._mapping = mapping;
    }

    /**
     * Clear the app term mapping.
     */
    public clearMapping(): void {
        this.setMapping(undefined);
    }
}
