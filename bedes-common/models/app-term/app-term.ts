import { AppTermAdditionalInfo } from "./app-term-additional-info";
import { IAppTerm } from "./app-term.interface";
import { TermType } from '../../enums/term-type.enum';
import { IAppTermAdditionalInfo } from './app-term-additional-info.interface';
import { TermMappingAtomic } from '../term-mapping/term-mapping-atomic';
import { TermMappingComposite } from '../term-mapping/term-mapping-composite';
import { UUIDGenerator } from '../uuid-generator/uuid-generator';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { BedesCompositeTerm } from '../bedes-composite-term/bedes-composite-term';
import { BedesTerm } from "../bedes-term";
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { isITermMappingAtomic } from '../term-mapping/term-mapping-atomic-guard';
import { isITermMappingComposite } from '../term-mapping/term-mapping-composite-guard';
import { ITermMappingAtomic } from '../term-mapping/term-mapping-atomic.interface';
import { ITermMappingComposite } from '../term-mapping/term-mapping-composite.interface';
import { BedesError } from '../../bedes-error/bedes-error';
import { HttpStatusCodes } from '../../enums/http-status-codes';

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
    /** Indicates if the Application information has changed */
    protected _hasChanged = false;
    public get hasChanged(): boolean {
        return this._hasChanged;
    }

    /**
     * Takes the source AppTerm values and assign them to the
     * corresponding properties on target.
     * @param source The object whose values are used to replace values on `target`
     * @param target The object being updated
     */
    public static updateObjectValues(source: AppTerm, target: AppTerm): void {
        target.id = source.id;
        target.name = source.name;
        target.description = source.description;
        target.termTypeId = source.termTypeId;
        target.unitId = source.unitId;
    }

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
        if (data._mapping) {
            if (isITermMappingAtomic(data._mapping)) {
                this._mapping = new TermMappingAtomic(data._mapping);
            }
            else if (isITermMappingComposite(data._mapping)) {
                this._mapping = new TermMappingComposite(data._mapping);
            }
            else {
                throw new Error(`${this.constructor.name}: unknown mapping object.`);
            }

        }
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
        if (value != this._name) {
            this._hasChanged = true;
        }
        this._name = value;
    }
    get description(): string | null | undefined {
        return this._description;
    }
    set description(value: string | null | undefined) {
        if (value != this._description) {
            this._hasChanged = true;
        }
        this._description = value;
    }
    get termTypeId(): TermType {
        return this._termTypeId;
    }
    set termTypeId(value: TermType) {
        if (value != this._termTypeId) {
            this._hasChanged = true;
        }
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
        if (value != this._unitId) {
            this._hasChanged = true;
        }
        this._unitId = value;
    }
    get mapping(): TermMappingAtomic | TermMappingComposite | null | undefined {
        return this._mapping;
    }
    set mapping(value: TermMappingAtomic | TermMappingComposite | null | undefined) {
        this._hasChanged = true;
        this._mapping = value;
    }

    private validate(): void {
        if (!this._name || typeof this.name !== 'string' || !this._name.trim()) {
            throw new Error(`${this.constructor.name}: No field name present.`);
        }
    }

    /**
     * Put the data back into a clean state
     */
    public clearChangeFlag(): void {
        this._hasChanged = false;
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
     * Maps a BedesTerm|BedesConstrainedList|BedescompositeTerm,
     * to the AppTerm instance.
     * @param bedesTerm The BedesTerm being mapped to the AppTerm instance.
     * @param [bedesTermOption] An optional BedesTermOption object.
     */
    public map(
        bedesTerm: BedesTerm | BedesConstrainedList  | BedesCompositeTerm,
        bedesTermOption?: BedesTermOption | undefined
    ): void {
        if (!bedesTerm.uuid || !bedesTerm.name) {
            throw new BedesError(
                'System error mapping terms.',
                HttpStatusCodes.ServerError_500,
                'System error mapping terms.'
            );
        }
        else if (bedesTerm instanceof BedesCompositeTerm) {
            // map a BEDES Composite Term
            this._mapping = new TermMappingComposite(<ITermMappingComposite>{
                _bedesName: bedesTerm.name,
                _compositeTermUUID: bedesTerm.uuid,
                _scopeId: bedesTerm.scopeId,
                _ownerName: bedesTerm.ownerName
            });
            // if (bedesTerm.uuid && bedesTerm.name) {
            //     this._mapping.compositeTermUUID = bedesTerm.uuid;
            //     this._mapping.bedesName = bedesTerm.name;
            // }
        }
        else if (bedesTerm instanceof BedesConstrainedList) {
            // map a BEDES Constrained List - an atomic term
            this._mapping = new TermMappingAtomic(<ITermMappingAtomic>{
                _bedesName: bedesTerm.name,
                _bedesTermUUID: bedesTerm.uuid,
                _bedesListOptionUUID: bedesTermOption ? bedesTermOption.uuid : undefined,
                _bedesTermType: TermType.ConstrainedList
            });
        }
        else if (bedesTerm instanceof BedesTerm) {
            // map a atomic BedesTerm
            this._mapping = new TermMappingAtomic(<ITermMappingAtomic>{
                _bedesName: bedesTerm.name,
                _bedesTermUUID: bedesTerm.uuid,
                _bedesTermType: TermType.Atomic
            });
        }
        else {
            throw new BedesError(
                'System error mapping terms.',
                HttpStatusCodes.ServerError_500,
                'System error mapping terms.'
            );
        }
        this._hasChanged = true;
    }

    /**
     * Set the mapping for this atomic term instance.
     */
    public setMapping(mapping: TermMappingAtomic | TermMappingComposite | undefined): void {
        this._mapping = mapping;
        this._hasChanged = true;
    }

    /**
     * Clear the app term mapping.
     */
    public clearMapping(): void {
        this.setMapping(undefined);
    }
}
