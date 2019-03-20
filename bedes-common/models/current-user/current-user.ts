import { UserStatus } from '../../enums/user-status.enum';
import { ICurrentUser } from './current-user.interface';
import { UserGroup } from '../../enums/user-group.enum';
import { BedesCompositeTerm } from '../bedes-composite-term/bedes-composite-term';

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
    // appIds
    private _appIds: Array<number>;
    /** Keeps track of the composite term ids the user has access to */
    private _compositeTermIds: Array<number>;

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
        if (Array.isArray(data._appIds)) {
            // create a copy of the array
            this._appIds = [...data._appIds];
        }
        else {
            this._appIds = new Array<number>();
        }
        // load the composite term ids
        if (Array.isArray(data._compositeTermIds)) {
            // create a copy of the array
            this._compositeTermIds = [...data._compositeTermIds];
        }
        else {
            this._compositeTermIds = new Array<number>();
        }
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
     * Determines if the values of the required parameters are valid values.
     * @returns true if the user is "valid"
     */
    public isValid(): boolean {
        return this.id > 0
        && this.status in UserStatus
        && this._userGroupId && this._userGroupId in UserGroup
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

    /**
     * Determines if a user can edit a given application.
     * @param appId The id of the mapping application.
     * @returns true if the user can edit the application defined by appId.
     */
    public canEditApplication(appId: number): boolean {
        if (appId && this._appIds.includes(appId)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Determines if the CurrentUser can edit a composite term.
     * @param compositeTermId 
     * @returns true if edit composite term 
     */
    public canEditCompositeTerm(compositeTermId: number): boolean {
        if (compositeTermId && this._compositeTermIds.includes(compositeTermId)) {
            return true;
        }
        else {
            return false;
        }
    }
}
