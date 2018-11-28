import { UserStatus } from '@bedes-common/enums/user-status.enum';

export interface IUserProfile {
    id: number;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
    email: string;
    organization: string | null | undefined;
    status: UserStatus;
}
