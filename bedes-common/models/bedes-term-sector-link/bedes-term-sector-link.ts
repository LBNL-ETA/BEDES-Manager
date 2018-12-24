import { IBedesTermSectorLink } from './bedes-term-sector-link.interface';

export class BedesTermSectorLink {
    private _id?: number | null | undefined;
    private _sectorId: number;

    constructor(data: IBedesTermSectorLink) {
        this._id = data._id;
        this._sectorId = data._sectorId;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get sectorId(): number {
        return this._sectorId;
    }
    set sectorId(value: number) {
        this._sectorId = value;
    }

    public toInterface(): IBedesTermSectorLink {
        return <IBedesTermSectorLink>{
            _id: this._id,
            _sectorId: this._sectorId
        };
    }
}