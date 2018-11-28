import { IUserLogin } from '@bedes-common/models/authentication/user-login.interface';

export class UserLogin {
    public email: string | null | undefined;
    public password: string | null | undefined;

    constructor(data?: IUserLogin) {
        if (data) {
            this.email = data.email;
            this.password = data.password;
        }
    }

}
