import { Request, Response } from 'express';
import { IUserStatus } from '@bedes-common/interfaces/user-status';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

/**
 * Logout the user.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export function logout(req: Request, res: Response) {
    req.logout();
    res.status(200).json(<IUserStatus>{status: UserStatus.NotLoggedIn});
}
