import { INewAccount } from '@bedes-common/models/authentication/new-account.interface';

export class NewAccount {
    public firstName: string | null | undefined;
    public lastName: string | null | undefined;
    public email: string | null | undefined;
    public organization: string | null | undefined;
    public password: string | null | undefined;
    public passwordConfirm: string | null | undefined;

    constructor(data?: INewAccount) {
        if (data) {
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.email = data.email;
            this.organization = data.organization;
            this.password = data.password;
            this.passwordConfirm = data.passwordConfirm;
        }
    }
}
