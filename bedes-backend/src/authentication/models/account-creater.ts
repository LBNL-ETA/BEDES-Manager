import { UserProfileNew } from './user-profile-new';
import { db } from '@bedes-backend/db';
import { BedesError } from '../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../bedes-common/enums/http-status-codes';
import { IUserProfile } from '../../../../bedes-common/models/authentication/user-profile/user-profile.interface';
import { authQuery } from '../query';
import { createLogger } from '@bedes-backend/logging';
import * as util from 'util';
import { sendVerificationCode } from '../messages';
const logger = createLogger(module);

export class AccountCreater {
    constructor(
        private user: UserProfileNew
    ){
    }

    public run(): Promise<boolean> {
        try {
            return db.tx(async (trans: any): Promise<boolean> => {
                if (!this.user.isValid()) {
                    throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
                }
                // try creating the user record in the database
                const newUser: IUserProfile = await authQuery.addUser(this.user);
                // user record has been created
                logger.debug(`user ${this.user.email} successfully created`);
                console.log(newUser);
                // send the new account email to the user
                return sendVerificationCode(newUser);
            })
        }
        catch (error) {
            console.log('an error occured in AccountCreater');
            console.log(error);
            throw error;
        }
    }
}