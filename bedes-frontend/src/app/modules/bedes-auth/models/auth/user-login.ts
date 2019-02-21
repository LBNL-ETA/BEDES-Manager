import { IUserLogin } from '@bedes-common/interfaces/user-login.interface';

export class UserLogin implements IUserLogin {
    public email: string;
    public password: string;
}
