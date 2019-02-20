import { CurrentUser, ICurrentUser } from '@bedes-common/models/current-user';
import { ICurrentUserAuth } from './current-user-auth.interface';

export class CurrentUserAuth extends CurrentUser {
    // password 
    private _password: string | undefined;
    get password(): string | undefined {
        return this._password;
    }
    
    constructor(data: ICurrentUserAuth) {
        super(<ICurrentUser>data);
        this._password = data._password;
    }
}
