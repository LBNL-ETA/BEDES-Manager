import { UserStatus } from '../../enums/user-status.enum';
import { UserGroup } from '../../enums/user-group.enum';

export interface ICurrentUser {
    _id: number;
    _uuid: string;
    _status: UserStatus;
    _userGroupId?: UserGroup | undefined;
    _firstName?: string | undefined;
    _lastName?: string | undefined;
    _email?: string | undefined;
    _organization?: string | undefined;
    _appIds?: Array<number> | undefined;
    _compositeTermIds?: Array<number> | undefined;
}
