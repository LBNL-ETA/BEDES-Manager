import { authQuery } from "../query";
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UserStatus } from "@bedes-common/enums/user-status.enum";
import { db } from "@bedes-backend/db";
import { sendPasswordResetMessage } from "../messages/password-reset-message";

export class PasswordResetter {
    constructor (
        private email: string
    ) {
    }

    public async run(): Promise<boolean> {
        try {
            // wrap database calls in a transaction context
            return db.tx(async (trans: any): Promise<boolean> => {
                // get the user information
                const user = await authQuery.getByEmail(this.email, trans);
                if (!user) {
                    throw new BedesError('Unknown error occurred resetting password', HttpStatusCodes.ServerError_500);
                }
                // set the new status for the user and confirm the results
                const newStatus = await authQuery.updateUserStatus(user._id, UserStatus.PasswordResetRequired, trans);
                if (newStatus !== UserStatus.PasswordResetRequired) {
                    throw new BedesError('Unknown error occurred resetting password', HttpStatusCodes.ServerError_500);
                }
                // get a password reset token
                const token = await authQuery.getPasswordResetToken(user._id, trans);
                // send the user an email
                // await
                const emailResult = await sendPasswordResetMessage(user, token);
                console.log(`emailSend Result = ${emailResult}`)
                return true;
            })
        }
        catch (error) {
            console.log('Error resetting password');
            console.log(error);
            throw error;
        }
    }
}