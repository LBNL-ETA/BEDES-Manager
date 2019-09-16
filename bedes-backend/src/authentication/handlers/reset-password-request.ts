import { Request, Response } from 'express';
import { createLogger } from '@bedes-backend/logging';
import { IPasswordResetRequest, IPasswordResetResponse } from '@bedes-common/models/password-reset/password-reset';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { PasswordResetter } from '@bedes-backend/authentication/models/password-resetter';
import { handleErrorResponse } from '@bedes-backend/util/handle-error-response';
const logger = createLogger(module);

/**
 * Reset a user's password.
 */
export async function resetPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
        const params: IPasswordResetRequest = req.body;
        if (!params || typeof params.accountEmail !== 'string') {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
        }
        const resetter = new PasswordResetter(params.accountEmail);
        const results = await resetter.run();
        if (results) {
            res.status(HttpStatusCodes.Ok_200).json(<IPasswordResetResponse>{success: results})
        }
        else {
            res.status(HttpStatusCodes.ServerError_500)
                .send('Error resetting password');
        }
    }
    catch(error) {
        console.log('Error in resetPassword');
        console.log(error);
        handleErrorResponse(error, res);
    }
}
