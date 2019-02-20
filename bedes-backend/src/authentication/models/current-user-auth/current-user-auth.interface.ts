import { ICurrentUser } from '@bedes-common/models/current-user';

export interface ICurrentUserAuth extends ICurrentUser {
    _password?: string | undefined;
}
