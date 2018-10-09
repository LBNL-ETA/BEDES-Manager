import {IMain, IDatabase} from 'pg-promise';
import pgPromise from 'pg-promise';
import * as promise from 'bluebird';
import {logger} from '../logging';

const pgp:IMain = pgPromise({
    // Set bluebird as the primise library
    promiseLib: promise,
    // uncomment the 'query' function to display the queries as they're executed
    // query: function(e) {
    //     console.log(e);
    // }
});

// Build the connection string from environment variables
// if the UNDER_TEST env variable is set, use the test database.
let cn: string;
if (process.env.UNDER_TEST) {
    logger.info('UNDER_TEST environment variable set... connecting to the test database');
    cn = `postgres://${process.env.DB_ADMIN_USER}:${process.env.DB_ADMIN_PASSWORD}@${process.env.DB_HOST}:${process.env.PG_TEST_PORT}/${process.env.PG_DB_NAME}`;
}
else {
    cn = `postgres://${process.env.DB_ADMIN_USER}:${process.env.DB_ADMIN_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}
const db:IDatabase<any> = pgp(cn);

export = db;
