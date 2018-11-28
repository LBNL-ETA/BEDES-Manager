/**
 * Data model for sending an email to a user
 * following a password reset request.
 *
 * @export
 * @class UserPasswordReset
 */
export class UserPasswordReset {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string,
        public url: string,
        public password: string
    ) {}

    public isValid(): boolean {
        if (this.firstName && this.lastName
        && this.email && this.url && this.password) {
            return true;
        }
        else {
            return false;
        }
    }
}
