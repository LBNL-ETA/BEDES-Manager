import { IMappingApplication } from "./mapping-application.interface";
import { Scope } from "../../enums/scope.enum";

export class MappingApplication {
    /** ID of the MappingApplication */
    private _id: number | null | undefined;
    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    /** Name of the MappingApplication */
    private _name: string;
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    /** Description of the MappingApplication */
    private _description: string | null | undefined;
    get description(): string | null | undefined {
        return this._description;
    }
    set description(value: string | null | undefined) {
        this._description = value;
    }
    /** Scope of the MappingApplication */
    private _scopeId: Scope;
    get scopeId(): Scope {
        return this._scopeId;
    }
    set scopeId(value: Scope) {
        this._scopeId = value;
    }
    /** Owner of the application */
    private readonly _ownerName: string | null | undefined;
    get ownerName(): string | null | undefined {
        return this._ownerName;
    }

    constructor(data: IMappingApplication) {
        this._id = data._id;
        this._name = data._name
        this._description = data._description;
        this._scopeId = data._scopeId || Scope.Private;
        this._ownerName = data._ownerName;
    }
}
