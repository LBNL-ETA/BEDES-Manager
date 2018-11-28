import { IUserProfile } from '@epb-common/interfaces/authentication/user-profile.interface';

declare namespace Express {
    export interface Request {
       user?: IUserProfile | undefined
    }
 }

