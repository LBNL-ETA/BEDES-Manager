import { IUserProfile } from '@bedes-common/models/authentication/user-profile/user-profile.interface';

declare namespace Express {
    export interface Request {
       user?: IUserProfile | undefined
    }
 }

