import { UserStatus } from '@bedes-common/enums/user-status.enum';

/**
 * Retrieve's home page's child route based on the current user's status.
 */
export function getNextAuthUrl(status: UserStatus): string {
    if (status == UserStatus.NotLoggedIn) {
        return '/home/login';
    }
    else if (status == UserStatus.NeedsVerify) {
        return '/home/verify';
    }
    else if (status == UserStatus.PasswordResetRequired) {
        return '/home/password-update';
    }
    else if (status == UserStatus.IsLoggedIn) {
        return '/home/logout';
    }
    else {
        throw new Error(`No valid handler for status_id ${status}`);
    }
}
