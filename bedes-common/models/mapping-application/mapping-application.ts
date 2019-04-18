import { IMappingApplication } from "./mapping-application.interface";
import { ApplicationScope } from '../../enums/application-scope.enum';

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
        if (value !== this._name) {
            this._hasChanged = true;
        }
        this._name = value;
    }
    /** Description of the MappingApplication */
    private _description: string | null | undefined;
    get description(): string | null | undefined {
        return this._description;
    }
    set description(value: string | null | undefined) {
        if (value !== this._description) {
            this._hasChanged = true;
        }
        this._description = value;
    }
    /** Scope of the MappingApplication */
    private _scopeId: ApplicationScope;
    get scopeId(): ApplicationScope {
        return this._scopeId;
    }
    set scopeId(value: ApplicationScope) {
        if (value !== this._scopeId) {
            this._hasChanged = true;
        }
        this._scopeId = value;
    }
    /** Owner of the application */
    private readonly _ownerName: string | null | undefined;
    get ownerName(): string | null | undefined {
        return this._ownerName;
    }
    /** Indicates if the Application information has changed */
    protected _hasChanged = false;
    public get hasChanged(): boolean {
        return this._hasChanged;
    }

    constructor(data: IMappingApplication) {
        this._id = data._id;
        this._name = data._name
        this._description = data._description;
        this._scopeId = data._scopeId || ApplicationScope.Private;
        this._ownerName = data._ownerName;
    }

    /**
     * Put the data back into a clean state
     */
    public clearChangeFlag(): void {
        this._hasChanged = false;
    }

    /**
     * Determines if the application has public scope.
     * @returns true if public 
     */
    public isPublic(): boolean {
        return this._scopeId === ApplicationScope.Public ? true : false;
    }

    /**
     * Determines if the application has private scope.
     * @returns true if private 
     */
    public isPrivate(): boolean {
        return this._scopeId === ApplicationScope.Private ? true : false;
    }
}
