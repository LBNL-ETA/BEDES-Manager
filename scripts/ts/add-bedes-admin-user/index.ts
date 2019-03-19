require('module-alias/register');
import * as path from 'path';
require('dotenv').config({
    path: path.resolve(__dirname, '../../../environment/backend.env')
})
import { db } from '@bedes-backend/db';
import { UserProfileNew } from '@bedes-backend/authentication/models/user-profile-new';
import { UserGroup } from '@bedes-common/enums/user-group.enum';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

// get the bedesAdmin email and password
const bedesAdminEmail = process.env.BEDES_ADMIN_EMAIL || '';
if (!bedesAdminEmail) {
    throw new Error('BEDES_ADMIN_PASSWORD has not been set in /environment/backend.env');
}
const bedesAdminPassword = process.env.BEDES_ADMIN_PASSWORD || '';
if (!bedesAdminPassword) {
    throw new Error('BEDES_ADMIN_PASSWORD has not been set in /environment/backend.env');
}

// check if the account exists
accountExists().then(
    async (exists: boolean) => {
        // create the account if it doesn't exist
        if (exists) {
            console.log('account already exists.');
            process.exit(0);
        }
        else {
            console.log('creating account...');
            const result = await createAdminAccount()
            if (result) {
                console.log(`done`)
                process.exit(0);
            }
            else {
                throw new Error('Account not created');
            }
        }
    }
)

/* Function Definitions */

/**
 * Determines if the account already exists.
 *
 * @returns Promise that resolves to true if the account exists
 *  false otherwise.
 * 
 * Queries the database for emails equal to bedes-manager@lbl.gov,
 * if the number of rows = 1 then true, else false.
 */
async function accountExists(): Promise<boolean> {
    // get a count of users with the epb-admin email address.
    const query = `
        select count(*) as count
        from auth.user
        where email = \${_bedesAdminEmail}
    `;
    const params = {
        _bedesAdminEmail: bedesAdminEmail
    }
    const results = await db.one(query, params);
    return results.count == 1 ? true : false;
}

/**
 * Create's the admin account.
 * 
 * Creates a new UserProfileNew object, and calls the backend authQuery.addUser() method.
 */
async function createAdminAccount(): Promise<boolean> {
    // create the new profile.
    const user = new UserProfileNew(
        'bedes',
        'manager',
        bedesAdminEmail,
        'LBL',
        bedesAdminPassword,
        bedesAdminPassword
    );
    // create the password hash
<<<<<<< HEAD
    const hashedPassword = await user.hashPassword();
=======
    const hashedPasseword = await user.hashPassword();
>>>>>>> eb56365... Created script to create the bedes-admin user account.
    const params = {
        _firstName: user.firstName,
        _lastName: user.lastName,
        _email: user.email,
        _organization: user.organization,
        _status: UserStatus.IsLoggedIn,
        _userGroupId: UserGroup.Administrator,
<<<<<<< HEAD
        _password: hashedPassword
=======
        _password: hashedPasseword
>>>>>>> eb56365... Created script to create the bedes-admin user account.
    }
    const query = `
        insert into auth.user (
            first_name, last_name, email, organization, status, user_group_id, password
        )
        values (
            \${_firstName},
            \${_lastName},
            \${_email},
            \${_organization},
            \${_status},
            \${_userGroupId},
            \${_password}
        )
        returning
            id
    `;
    const result = await db.one(query, params);
    return result.id > 0 ? true : false;

}
