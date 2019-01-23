import { UserStatus } from '../../enums/user-status.enum';

export interface ICurrentUser {
    _status: UserStatus;
    _userGroupId: number;
    _name: string;
}
