import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesSector } from '@bedes-common/models/bedes-sector/bedes-sector.interface';

export class BedesSectorQuery {
    private sqlGetAllRecords!: QueryFile

    constructor() { 
        this.initSql();
    }

    /**
     * Load the SQL queries.
     *
     * @private
     * @memberof User
     */
    private initSql(): void {
        this.sqlGetAllRecords = sql_loader(path.join(__dirname, 'get-all-records.sql'))
    }

    /**
     * Retrieve all of the BedesSector recods.
     *
     * @param {*} [transaction]
     * @returns {Promise<Array<IBedesSector>>}
     * @memberof BedesDataTypeQuery
     */
    public getAllRecords(transaction?: any): Promise<Array<IBedesSector>> {
        try {
            if (transaction) {
                return transaction.many(this.sqlGetAllRecords);
            }
            else {
                return db.many(this.sqlGetAllRecords);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllRecords`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

}
