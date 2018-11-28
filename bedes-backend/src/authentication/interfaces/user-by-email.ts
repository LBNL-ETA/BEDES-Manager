import { UserStatus } from '@bedes-common/enums/user-status.enum';

export interface IUserByEmail {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    status: UserStatus;
}
