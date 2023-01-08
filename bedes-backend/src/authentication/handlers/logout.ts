import { Request, Response } from 'express';
import { ICurrentUser } from '@bedes-common/models/current-user';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

/**
 * Logout the user.
 */
export function logout(req: Request, res: Response) {
    req.logout((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error logging out');
        } else {
            // return a defaul tuser
            res.status(200).json(CurrentUser.makeDefaultUser());
        }
    });
}
