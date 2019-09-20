import { isUUID } from '@bedes-common/util/is-uuid';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { authQuery } from '../query';
import { db } from '@bedes-backend/db';
import { PasswordUpdateAuth } from './password-update-auth';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

export interface IValidToken {
    /** indicates if the pw-reset token was valid */
    isValid: boolean;
}

/**
 * Updates the password for a user that has forgotten a password.
 */
export class PasswordResetUpdater {

    constructor(
        private uuid: string,
        private token: string,
        private passwordUpdate: PasswordUpdateAuth
    ) {
    }

    public async run(): Promise<boolean> {
        try {
            // wrap all db calls in transaction context
            return db.tx(async (trans: any): Promise<boolean> => {
                this.validateParams();
                console.log('params validated');
                // get the user info for the pw reset request
                const user = await authQuery.getByUUID(this.uuid, trans);
                // validate the pw-reset token for the user
                const validateResult = await authQuery.validatePasswordResetToken(user._id, this.token, trans);
                if (!validateResult.isValid) {
                    console.log('Expired token')
                    throw new BedesError('Expired token', HttpStatusCodes.BadRequest_400);
                }
                // token is valid, reset the password
                await authQuery.updateUserPassword(user._id, this.passwordUpdate, trans)
                // set the user status back to a valid user
                await authQuery.updateUserStatus(user._id, UserStatus.IsLoggedIn, trans);

                return true;
            })

        } catch (error) {
            console.log(`${this.constructor.name}: error updating user password`);
            console.log(error);
            throw error;
        }
    }

    private validateParams(): void {
        if (typeof this.uuid !== 'string' || !isUUID(this.uuid)) {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
        }
        else if (typeof this.token !== 'string' || !isUUID(this.token)) {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
        }
        else if (!this.passwordUpdate.isValid()) {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
        }
    }
}