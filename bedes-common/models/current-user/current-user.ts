// import { ICurrentUser } from './current-user.interface';
// import { UserStatus } from '../../enums/user-status.enum';
// import { UserGroup } from '../../enums/user-group.enum';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { ICurrentUser } from './current-user.interface';
import { UserGroup } from '../../enums/user-group.enum';

/**
 * Object that represents the current authenticated user.
 * 
 * The backend will send back CurrentUser instances when authenticating
 * and checking the status on the current user on an initial page load.
 * 
 * The front-end uses this class to check the users's status and group
 * for access rights.
 */
export class CurrentUser {
    /**
     * Static method that creates a **default** user,
     * ie a user that's not authenticated.
     *
     * @static
     * @returns A representation of a not-logged-in user.
     */
    public static makeDefaultUser(): CurrentUser {
        return new CurrentUser(<ICurrentUser>{
            _status: UserStatus.NotLoggedIn
        });
    }

    /* Attributes */
    // id
    private _id: number;
    get id(): number {
        return this._id;
    }
    // User login Status
    private _status: UserStatus;
    get status(): UserStatus {
        return this._status;
    }
    // userGroupId
    private _userGroupId: UserGroup | undefined;
    get userGroup(): UserGroup | undefined {
        return this._userGroupId;
    }
    // first name
    private _firstName: string | undefined;
    get firstName(): string | undefined {
        return this._firstName;
    }
    // last name
    private _lastName: string | undefined;
    get lastName(): string | undefined {
        return this._lastName;
    }
    // email 
    private _email: string | undefined;
    get email(): string | undefined {
        return this._email;
    }
    // organization 
    private _organization: string | undefined;
    get organization(): string | undefined {
        return this._organization;
    }

    /**
     * Build an instance of the current user.
     */
    constructor(data: ICurrentUser) {
        this._id = data._id;
        this._status = data._status || UserStatus.NotLoggedIn;
        this._firstName = data._firstName;
        this._lastName = data._lastName;
        this._email = data._email;
        this._userGroupId = data._userGroupId;
    }

    /* Public Interface Methods */
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
     * @returns True if the user is not logged in.
     */
    public isNotLoggedIn(): boolean {
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
        return !this.isAdmin();
    }
}