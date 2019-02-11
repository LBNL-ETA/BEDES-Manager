import { IAppTermListOption } from './app-term-list-option.interface';
import { TermMappingListOption } from '../term-mapping/term-mapping-list-option';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { ITermMappingListOption } from '../term-mapping/term-mapping-list-option.interface';
import { UUIDGenerator } from '../uuid-generator/uuid-generator';

export class AppTermListOption extends UUIDGenerator {
    private _id: number | null | undefined;
    private _name: string;
    private _uuid: string;
    private _description: string | null | undefined;
    private _unitId: number | null | undefined;
    private _mapping: TermMappingListOption | null | undefined;

    constructor(data: IAppTermListOption) {
        super();
        this._id = data._id;
        this._name = data._name;
        this._description = data._description;
        this._uuid = data._uuid || this.generateUUID();
        this._unitId = data._unitId;
        if (data._mapping) {
            this._mapping = new TermMappingListOption(data._mapping);
        }
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
    get uuid(): string{
        return this._uuid;
    }
    get description(): string | null | undefined {
        return this._description;
    }
    set description(value: string | null | undefined ) {
        this._description = value;
    }
    get unitId(): number | null | undefined {
        return this._unitId;
    }
    set unitId(value: number | null | undefined ) {
        this._unitId = value;
    }
    get mapping(): TermMappingListOption | null | undefined {
        return this._mapping;
    }
    set mapping(value: TermMappingListOption | null | undefined ) {
        this._mapping = value;
    }

    /**
     * Map's the given bedesTermOption to the AppTermListOption instance.
     *
     * @param bedesTermOption The BedesTermOption to map.
     */
    public map(bedesTermOption: BedesTermOption): void {
        this._mapping = new TermMappingListOption(<ITermMappingListOption>{
            _bedesOptionName: bedesTermOption.name,
            _bedesTermOptionUUID: bedesTermOption.uuid
        });
    }

    /**
     * Transforms the object to an IAppTermadditionalInfo object.
     */
    public toInterface(): IAppTermListOption {
        return <IAppTermListOption>{
            _id: this._id,
            _name: this._name,
            _uuid: this._uuid,
            _description: this._description,
            _unitId: this._unitId,
            _mapping: this._mapping ? this._mapping.toInterface() : undefined
        };
    }
}