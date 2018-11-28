import * as bcrypt from 'bcrypt';

/**
 * Compares two password strings using the bcrypt library,
 * where either one of the passwords can be the hashed version
 * stored in the db.
 *
 * @export
 * @param {string} pw1
 * @param {string} pw2
 * @returns {Promise<boolean>}
 */
export function comparePassword(pw1: string, pw2: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(pw1, pw2, (err: Error, isValid: boolean) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(isValid);
            }
        });
    });
}
