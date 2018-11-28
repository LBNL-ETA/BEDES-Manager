/**
 * Model for updating a user profile record.
 *
 * @class UserProfileUpdate
 */
export class UserProfileUpdate {
    constructor(
        public id: number,
        public firstName: number,
        public lastName: number,
        public email: number,
        public password: string
    ) {
    }

    public isValid(): boolean {
        return true;
    }
}
