import { IBedesCompositeTermShort } from './bedes-composite-term-short.interface';

export class BedesCompositeTermShort {
    private _id: number | null | undefined;
    private _signature: string;
    private _name: string | null | undefined;
    private _description: string | null | undefined;
    private _unitId: number | null | undefined;
    private _uuid: string | null | undefined;

    constructor(data?: IBedesCompositeTermShort) {
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            this._name = data._name;
            this._description = data._description;
            this._unitId = data._unitId;
            this._uuid = data._uuid;
        }
    }

    get id():  number | null | undefined {
        return this._id;
    }
    set id(value:  number | null | undefined) {
        this._id = value;
    }
    get signature():  string {
        return this._signature;
    }
    set signature(value:  string) {
        this._signature = value;
    }
    get name():  string | null | undefined {
        return this._name;
    }
    set name(value:  string | null | undefined) {
        this._name = value;
    }
    get description():  string | null | undefined {
        return this._description;
    }
    set description(value:  string | null | undefined) {
        this._description = value;
    }
    get unitId():  number | null | undefined {
        return this._unitId;
    }
    set unitId(value:  number | null | undefined) {
        this._unitId = value;
    }
    get uuid():  string | null | undefined {
        return this._uuid;
    }
    set uuid(value:  string | null | undefined) {
        this._uuid = value;
    }

    public toInterface(): IBedesCompositeTermShort {
        return <IBedesCompositeTermShort>{
            _id: this.id,
            _signature: this.signature,
            _name: this.name,
            _description: this.description,
            _unitId: this.unitId,
        }
    }
}