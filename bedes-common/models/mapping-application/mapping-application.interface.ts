import { ApplicationScope } from '../../enums/application-scope.enum';

export interface IMappingApplication {
    _id?: number | null | undefined;
    _name: string;
    _description?: string | null | undefined;
    _scopeId?: ApplicationScope | null | undefined;
    _ownerName?: string | null | undefined;
}
