import { Response } from 'express';
import { BedesError } from '../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../bedes-common/enums/http-status-codes';

/**
 * Sends an appropriate response to the user based on the type of error.
 * @param error 
 * @param response 
 */
export function handleErrorResponse(error: any, response: Response): void {
    if (error instanceof BedesError) {
        response.status(error.responseStatusCode).send(error.message);
    }
    else if (error.statusCode && error.responseMessage) {
        response.status(error.statusCode).send(error.responseMessage);
    }
    else {
        response.status(HttpStatusCodes.ServerError_500).send('Unknown error.')
    }
}