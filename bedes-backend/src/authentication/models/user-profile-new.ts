/**
 * Model for new user profile records.
 *
 * @export
 * @class UserProfileNew
 */
// export class UserProfileNew {
//     constructor(
//         public first_name: number,
//         public last_name: number,
//         public email: number,
//         public organization: string,
//         public passwordHash: string
//     ) {
//     }

//     public isValid(): boolean {
//         return true;
//     }
// }

import { UserPasswordHash } from './password-hash';

export class UserProfileNew extends UserPasswordHash {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string,
        public organization: string,
        public password: string,
        public passwordConfirm: string
    ) {
        super(password);
    }

    /**
     * Make sure the new user has all of the required fields.
     *
     * @returns {boolean}
     * @memberof UserProfileNew
     */
    public isValid(): boolean {
        if (super.isValid() && this.firstName
        && this.lastName && this.email && this.organization
        && this.password && this.password === this.passwordConfirm
    ) {
            return true;
        }
        else {
            return false;
        }
    }
}
