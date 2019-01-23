import { ICurrentUser } from './current-user.interface';
import { UserStatus } from '../../enums/user-status.enum';
import { UserGroup } from '../../enums/user-group.enum';

/**
 * Object that represents the current user's authentication status.
 */
export class CurrentUser {
    // User Status
    private _status: UserStatus;
    get status(): UserStatus {
        return this._status;
    }
    // name
    private _name: string;
    get name(): string {
        return this._name;
    }
    // userGroupId
    private _userGroupId: number;

    constructor(data: ICurrentUser) {
        this._status = data._status || UserStatus.NotLoggedIn;
        this._name = data._name || 'Guest';
        this._userGroupId = data._userGroupId || UserGroup.Standard;
    }

    public static makeDefaultUser(): CurrentUser {
        return new CurrentUser(<ICurrentUser>{
            _status: UserStatus.NotLoggedIn,
            _name: 'Guest'
        });
    }

    /**
     * Returns true if the user is currently logged in.
     */
    public isLoggedIn(): boolean {
        return this._status === UserStatus.IsLoggedIn
            ? true
            : false;
    }

    /**
     * Returns true if the user needs to verify their account, false otherwise.
     */
    public needsVerify(): boolean {
        return this._status === UserStatus.NeedsVerify
            ? true
            : false;
    }

    /**
     * @returns Returns true if the current user needs a password reset, false otherwise.
     */
    public needsPasswordReset(): boolean {
        return this._status === UserStatus.PasswordResetRequired
            ? true
            : false;
    }

    /**
     * @returns True if the user is not logged int.
     */
    public isGuest(): boolean {
        return this._status === UserStatus.NotLoggedIn
            ? true
            : false;
    }

    /**
     * @returns Returns true if the current user is an administrator
     */
    public isAdmin(): boolean {
        return this._userGroupId === UserGroup.Administrator
            ? true
            : false;
    }

    /**
     * @returns Returns true if the current user is a standard user.
     */
    public isStandardUser(): boolean {
        return this._userGroupId !== UserGroup.Administrator
            ? true
            : false;
    }
}