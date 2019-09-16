import { Request, Response } from 'express';
import { createLogger } from '@bedes-backend/logging';
import { handleErrorResponse } from '@bedes-backend/util/handle-error-response';
import { IPasswordUpdate } from '@bedes-common/interfaces/password-update/password-update.interface';
import { PasswordResetUpdater } from '../models/password-reset-updater';
import { PasswordUpdateAuth } from '../models/password-update-auth';
const logger = createLogger(module);

/**
 * Finish reseting a user's password.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
    try {
        const params = getParams(req);
        const updater = new PasswordResetUpdater(
            params.uuid,
            params.token,
            params.passwordUpdate
        );
        const result = await updater.run();
        res.json({success: result})
    }
    catch(error) {
        console.log('Error in resetPassword');
        console.log(error);
        handleErrorResponse(error, res);
    }
}

/**
 * Get the required parameters from the request.
 */
function getParams(request: Request): {passwordUpdate: PasswordUpdateAuth, uuid: string, token: string} {
    // get the password info from the request body
    const pw = <IPasswordUpdate>request.body;
    const passwordUpdate = new PasswordUpdateAuth(pw._password, pw._passwordConfirm);
    // uuid and token are taken from the url parameters
    return {
        passwordUpdate,
        uuid: request.params.uuid,
        token: request.params.token
    }
}
