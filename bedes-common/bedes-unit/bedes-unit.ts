import { IBedesUnit } from "./bedes-unit.template";

export class BedesUnit implements IBedesUnit {
    _id: number | null | undefined;
    _name: string;

    constructor(data: IBedesUnit) {
        this._id = data._id;
        this._name = data._name;
    }

    
    public get id(): number | null | undefined {
        return this._id;
    }
    public set id(value: number | null | undefined) {
        this._id = value;
    }
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    
}