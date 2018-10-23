import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@script-common/logging';
const logger = createLogger(module);
import { IBedesDefinitionSource } from '@bedes-common/bedes-definition-source';

class BedesDefinitionSourceQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;

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
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    public newRecord(item: IBedesDefinitionSource): Promise<any> {
        if (!item._name) {
            logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-newRecord`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: item._name
        };
        return db.one(this.sqlInsert, params);
    }

    /**
     * Gets BedesUnit record given a unit name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string): Promise<any> {
        if (!name) {
            logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: name
        };
        return db.oneOrNone(this.sqlGetByName, params);
    }

    // public updateRecord(item: BedesUnit): Promise<number> {
    //     if (!item._id) {
    //         logger.error(`updateImplementationPercentage: missing parameter _id - ${util.inspect(item)}`);
    //         throw new Error('Invalid parameters.');
    //     }
    //     const params = {
    //         _id: item._id,
    //         _design: item._design,
    //         _projectManagement: item._projectManagement,
    //         _performanceBonds: item._performanceBonds,
    //         _commissioningTraining: item._commissioningTraining,
    //         _overhead: item._overhead,
    //         _profit: item._profit
    //     };
    //     if (transaction) {
    //         return transaction.result(
    //             this.sqlGetByName,
    //             params,
    //             (r: any) => r.rowCount
    //         );
    //     }
    //     else {
    //         return db.result(
    //             this.sqlUpdate,
    //             params,
    //             (r: any) => r.rowCount
    //         );
    //     }
    // }

}

export { BedesDefinitionSourceQuery };
