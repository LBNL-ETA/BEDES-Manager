import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { AppTerm, IAppTerm, AppTermAdditionalInfo, IAppTermAdditionalInfo } from '@bedes-common/models/app-term';

export class AppTermQuery {
    private sqlInsertTerm!: QueryFile;
    private sqlInsertAdditionalData!: QueryFile;

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
        this.sqlInsertTerm = sql_loader(path.join(__dirname, 'insert-app-term.sql'))
        this.sqlInsertAdditionalData = sql_loader(path.join(__dirname, 'insert-additional-data.sql'))
    }

    public async newAppTerm(item: IAppTerm, transaction?: any): Promise<IAppTerm> {
        try {
            if (!item._name || !item._name.trim()) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _appId: item._appId,
                _fieldCode: item._fieldCode,
                _name: item._name,
                _description: item._description
            }
            let appTerm: IAppTerm;
            if (transaction) {
                appTerm = await transaction.one(this.sqlInsertTerm, params);
            }
            else {
                appTerm = await db.one(this.sqlInsertTerm, params);
            }
            if (!appTerm._id) {
                throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
            }
            logger.debug('Created AppTerm');
            logger.debug(util.inspect(appTerm));
            // write the additional data, if any
            if (item._additionalInfo.length) {
                let promises =  new Array<Promise<any>>();
                // @ts-ignore
                item._additionalInfo.map((d) => promises.push(this.newAppTermAdditionalData(appTerm._id, d, transaction)));
                appTerm._additionalInfo = await Promise.all(promises);
                
                logger.debug(`${this.constructor.name}: successfully wrote additional data`);
                logger.debug(util.inspect(appTerm));
            }
            return appTerm;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    public async newAppTermAdditionalData(termId: number, item: IAppTermAdditionalInfo, transaction?: any): Promise<IAppTermAdditionalInfo> {
        try {
            if (!item._appFieldId) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _appTermId: termId,
                _appFieldId: item._appFieldId,
                _value: item._value
            }
            if (transaction) {
                return transaction.one(this.sqlInsertAdditionalData, params);
            }
            else {
                return db.one(this.sqlInsertAdditionalData, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }

    }
}
