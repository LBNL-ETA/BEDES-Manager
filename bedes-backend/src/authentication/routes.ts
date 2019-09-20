import { Router, Request, Response } from 'express';
import { authenticate } from 'passport';
import * as handlers from './handlers';

/**
 * Mounts the authentication routes.
 */
export function mountRoutes(router: Router) {
    // router.get('/login_status', (req: any, res: Response) => handlers.validateUser(<Request>req, res));
    router.post('/login', authenticate('local'), handlers.status);
    router.get('/logout', handlers.logout);
    router.post('/user_profile', handlers.addUser);
    router.put('/password-update', handlers.updatePassword);
    router.post('/password-reset/:uuid/:token', handlers.resetPassword);
    router.post('/password-reset', handlers.resetPasswordRequest);
    router.get('/status', handlers.status);
    router.put('/validate', handlers.verifyRegistrationCode);
    router.get('/verification-code', handlers.newRegistrationCode);
    router.post('/verification-code/:verificationCode', handlers.verifyRegistrationCode);
}
