import * as bcrypt from 'bcrypt';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

export abstract class UserPasswordHash {
    constructor(
        public password: string
    ) {}

    /**
     * Make sure the password isn't blank.
     *
     * @returns {boolean}
     * @memberof UserPasswordHash
     */
    public isValid(): boolean {
        if (this.password && this.password.trim()) {
            return true;
        }
        else {
            return false;
        }
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
