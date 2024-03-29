import {UserStatus} from '../../enums/user-status.enum';
import {ICurrentUser} from './current-user.interface';
import {UserGroup} from '../../enums/user-group.enum';
import {BedesCompositeTerm} from '../bedes-composite-term/bedes-composite-term';
import {BedesCompositeTermShort} from '../bedes-composite-term-short';
import {MappingApplication} from '../mapping-application';

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
    private _uuid: string;
    get uuid(): string {
        return this._uuid;
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
        this._uuid = data._uuid;
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
    public canEditApplication(app: MappingApplication): boolean {
        return (this.isApplicationOwner(app) && !app.isApproved()) || this.isAdmin();
    }

    /**
     * Indicates if the CurrentUser is the owner of a MappingApplication.
     * @param app The MappingApplication to test for ownership.
     * @returns true if the CurrentUser is the owner
     */
    public isApplicationOwner(app: MappingApplication): boolean {
        return !!(app && app.id && this._appIds.includes(app.id));
    }

    /**
     * Determines if the CurrentUser can edit a composite term.
     * @param compositeTermId 
     * @returns true if edit composite term 
     */
    public canEditCompositeTerm(compositeTerm: BedesCompositeTerm | BedesCompositeTermShort): boolean {
        if (compositeTerm instanceof BedesCompositeTerm && compositeTerm.isNewTerm()) {
            // terms that haven't been saved can be edited
            return true;
        }
        else if(compositeTerm.hasApprovedScope()) {
            // approved items are locked
            return false;
        }
        else if (this.isCompositeTermOwner(compositeTerm)) {
            // owners of terms can edit their own terms
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Determines whether the user can delete the composite term.
     * @param compositeTerm 
     * @returns true if the composite term can be removed by the user.
     */
    public canRemoveCompositeTerm(compositeTerm: BedesCompositeTerm | BedesCompositeTermShort): boolean {
        if (this.isCompositeTermOwner(compositeTerm) && !compositeTerm.hasApprovedScope()) {
            // only owners can remove their non-approved terms
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Determines if the current user owns the compositeTerm
     * @param compositeTerm 
     * @returns true if owner 
     */
    public isCompositeTermOwner(compositeTerm: BedesCompositeTerm | BedesCompositeTermShort): boolean {
        return compositeTerm.id && this._compositeTermIds.includes(compositeTerm.id)
            ? true
            : false;
    }
}
