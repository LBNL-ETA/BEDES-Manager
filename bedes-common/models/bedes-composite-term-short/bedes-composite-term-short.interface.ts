import { Scope } from "../../enums/scope.enum";

export interface IBedesCompositeTermShort {
    _id?: number | null | undefined;
    _signature: string;
    _name: string | null | undefined;
    _description?: string | null | undefined;
    _unitId?: number | null | undefined;
    _uuid?: string | null | undefined;
    _userId?: number | null | undefined;
    _scopeId?: Scope | null | undefined;
    _ownerName?: string | null | undefined;
}
