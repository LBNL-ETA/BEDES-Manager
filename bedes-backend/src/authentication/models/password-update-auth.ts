import * as bcrypt from 'bcrypt';
import * as util from 'util';
import { PasswordUpdate } from '@bedes-common/interfaces/password-update/password-update';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

/**
 * Extends the PasswordUpdate class to provide a method for hashing the new password.
 */
export class PasswordUpdateAuth extends PasswordUpdate {
    constructor(password: string, passwordConfirm: string) {
        super(password, passwordConfirm);
    }

    public hashPassword(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isValid()) {
                reject('Invalid UserPasswordHash');
            }
            else {
                bcrypt.hash(this.password, 12, (error, passwordHash) => {
                    if (error) {
                        logger.debug('Error in UserPasswordUpdate - hash');
                        logger.error(util.inspect(error));
                        reject();
                    }
                    resolve(passwordHash);
                });
            }
        });
    }
}