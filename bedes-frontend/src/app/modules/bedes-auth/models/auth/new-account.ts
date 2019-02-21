import { INewAccount } from '@bedes-common/interfaces/new-account.interface';

export class NewAccount implements INewAccount {
    public firstName: string;
    public lastName: string;
    public email: string;
    public organization: string;
    public password: string;
    public passwordConfirm: string;

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
