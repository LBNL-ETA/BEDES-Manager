import { IUserLoginResponse } from '@bedes-common/interfaces/user-login-response.interface';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

export class UserLoginResponse implements IUserLoginResponse {
    public status: UserStatus;

    constructor(data?: IUserLoginResponse) {
        if (data) {
            this.status = data.status;
        }
    }

}
