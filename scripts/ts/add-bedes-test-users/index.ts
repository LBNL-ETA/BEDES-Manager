require('module-alias/register');
import * as path from 'path';
import * as fs from 'fs';
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({
        path: envPath,
    });
}
import { db } from '@bedes-backend/db';
import { UserProfileNew } from '@bedes-backend/authentication/models/user-profile-new';
import { UserGroup } from '@bedes-common/enums/user-group.enum';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { v4 } from 'uuid';

(async () => {
    try {
        const user = getEnvUser(1);
        if (user) {
            await createUserAccount(user, UserStatus.IsLoggedIn, UserGroup.Standard);
            process.exit(0);
        }
    } catch (error) {
        console.log(error);
        console.log('Error creating test users');
        process.exit(1);
    }
})();

function getEnvUser(userNum: number): UserProfileNew {
    const firstName = process.env[`USER_${userNum}_FIRST`];
    const lastName = process.env[`USER_${userNum}_LAST`];
    const email = process.env[`USER_${userNum}_EMAIL`];
    const org = process.env[`USER_${userNum}_ORG`];
    const password = process.env[`USER_${userNum}_PASSWORD`];

    if (!firstName || !lastName || !email || !org || !password) {
        throw new Error(`env user '${userNum} not defined`);
    }

    return new UserProfileNew(firstName, lastName, email, org, password, password);
}

async function createUserAccount(user: UserProfileNew, status: UserStatus, group: UserGroup): Promise<void> {
    // check if the account exists
    const exists = await accountExists(user);
    // create the account if it doesn't exist
    if (exists) {
        console.log(`account ${user.email} already exists.`);
    } else {
        console.log(`creating account ${user.email}...`);
        const result = await createUserAccountRecord(user, status, group);
        if (result) {
            console.log(`done`);
        } else {
            throw new Error('Account not created');
        }
    }
}

/* Function Definitions */

/**
 * Determines if the account already exists.
 *
 * @returns Promise that resolves to true if the account exists
 *  false otherwise.
 *
 * Queries the database for emails equal to bedes-manager@mail.eta.lbl.gov,
 * if the number of rows = 1 then true, else false.
 */
export async function accountExists(user: UserProfileNew): Promise<boolean> {
    // get a count of users with the epb-admin email address.
    const query = `
        select count(*) as count
        from auth.user
        where email = \${email}
    `;
    const params = {
        email: user.email,
    };
    const results = await db.oneOrNone(query, params);
    return results.count == 1 ? true : false;
}

/**
 * Create's the admin account.
 *
 * Creates a new UserProfileNew object, and calls the backend authQuery.addUser() method.
 */
export async function createUserAccountRecord(
    user: UserProfileNew,
    status: UserStatus,
    group: UserGroup
): Promise<boolean> {
    // create the password hash
    const hashedPasseword = await user.hashPassword();
    const params = {
        _firstName: user.firstName,
        _lastName: user.lastName,
        _email: user.email,
        _organization: user.organization,
        _status: status,
        _userGroupId: group,
        _password: hashedPasseword,
        _uuid: v4(),
    };
    const query = `
        insert into auth.user (
            first_name, last_name, email, organization, status, user_group_id, password, uuid
        )
        values (
            \${_firstName},
            \${_lastName},
            \${_email},
            \${_organization},
            \${_status},
            \${_userGroupId},
            \${_password},
            \${_uuid}
        )
        returning
            id
    `;
    const result = await db.one(query, params);
    return result.id > 0 ? true : false;
}
