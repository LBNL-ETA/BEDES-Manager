import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IAppTermListOption } from '@bedes-common/models/app-term/app-term-list-option.interface';
import { BedesError } from '../../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../../bedes-common/enums/http-status-codes';

export class AppTermListOptionQuery {
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlDelete: QueryFile;

    constructor() { 
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
    }

    /**
     * Insert a new AppTermListOption record.
     * @param appTermId - The id of the term the option is linked to.
     */
    public newRecord(appTermId: number, item: IAppTermListOption, transaction?: any): Promise<IAppTermListOption> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _appTermId: appTermId,
                _name: item._name,
                _unitId: item._unitId || null,
                _uuid: null
            };
            if (transaction) {
                return transaction.one(this.sqlInsert, params);
            }
            else {
                return db.one(this.sqlInsert, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            console.log(item);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Update an existing AppTermListOption record.
     */
    public updateRecord(item: IAppTermListOption, transaction?: any): Promise<IAppTermListOption> {
        try {
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: updateRecord expects an id and name`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _id: item._id,
                _name: item._name.trim() || null,
                _unitId: item._unitId || null
            };
            if (transaction) {
                return transaction.one(this.sqlUpdate, params);
            }
            else {
                return db.one(this.sqlUpdate, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Remove a AppTermListOption record.
     */
    public deleteRecord(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _id: id
            };
            const dbContext = transaction ? transaction : db;
            return dbContext.result(this.sqlDelete, params, (a: any) => a.rowCount)
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
