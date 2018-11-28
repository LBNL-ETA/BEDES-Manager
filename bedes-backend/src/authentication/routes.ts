import { Router, Request, Response } from 'express';
import { authenticate } from 'passport';

import * as handlers from './handlers';

/**
 * Mounts the authentication routes.
 *
 * @export
 * @param {Router} router
 */
export function mountRoutes(router: Router) {
    // router.get('/login_status', (req: any, res: Response) => handlers.validateUser(<Request>req, res));
    router.post('/login', authenticate('local'), handlers.status);
    // router.post('/login',
    //     // wrap passport.authenticate call in a middleware function
    //     function (req, res, next) {
    //         // call passport authentication passing the "local" strategy name and a callback function
    //         authenticate('local', function (error, user, info) {
    //             // this will execute in any case, even if a passport strategy will find an error
    //             // log everything to console
    //             console.log(error);
    //             console.log(user);
    //             console.log(info);

    //             if (error) {
    //                 res.status(401).send(error);
    //             } else if (!user) {
    //                 res.status(401).send(info);
    //             } else {
    //                 next();
    //             }

    //             res.status(401).send(info);
    //         })(req, res);
    //     },

    //     // function to call once successfully authenticated
    //     function (req, res) {
    //         res.status(200).send('logged in!');
    //     });
    router.get('/logout', handlers.logout);
    router.post('/user_profile', handlers.addUser);
    router.get('/status', handlers.status);
    router.put('/validate', handlers.verifyRegistrationCode);
    router.get('/verification-code', handlers.newRegistrationCode);
}
