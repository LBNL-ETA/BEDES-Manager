import { IUserProfile } from './user-profile.interface';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

export class UserProfile {
    public id: number;
    public firstName: string | null | undefined;
    public lastName: string | null | undefined;
    public email: string | null | undefined;
    public organization: string | null | undefined;
    public status: UserStatus;

    constructor(data: IUserProfile) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.organization = data.organization;
        this.status = data.status;
    }
    
}
