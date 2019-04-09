import { Scope } from "../../enums/scope.enum";

export interface IMappingApplication {
    _id?: number | null | undefined;
    _name: string;
    _description?: string | null | undefined;
    _scopeId?: Scope | null | undefined;
    _ownerName?: string | null | undefined;
}
