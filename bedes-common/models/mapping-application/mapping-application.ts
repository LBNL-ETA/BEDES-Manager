import { IMappingApplication } from "./mapping-application.interface";

export class MappingApplication {
    private _id: number | null | undefined;
    private _name: string;
    private _description: string | null | undefined;

    constructor(data: IMappingApplication) {
        this._id = data._id;
        this._name = data._name
        this._description = data._description;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
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

}