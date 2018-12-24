import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesTermSectorLink } from '@bedes-common/models/bedes-term-sector-link';

export class BedesTermSectorLinkQuery {
    private sqlInsert!: QueryFile;
    private sqlDelete!: QueryFile;
    private sqlDeleteByTermId!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'));
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'));
        this.sqlDeleteByTermId = sql_loader(path.join(__dirname, 'delete-by-termId.sql'));
    }

    /**
     * Links a BedesTerm objec to various Sectors.
     */
    public insertAll(termId: number, items: Array<IBedesTermSectorLink>, transaction?: any): Promise<Array<IBedesTermSectorLink>> {
        try {
            if (!termId) {
                logger.error(`${this.constructor.name}: invalid parameters`);
                throw new Error('Missing required parameters.');
            }
            const promises = new Array<Promise<IBedesTermSectorLink>>();
            // write each sector, resulting in an array of promises.
            for (let item of items) {
                const params = {
                    _termId: termId,
                    _sectorId: item._sectorId
                };
                if (transaction) {
                    promises.push(transaction.one(this.sqlInsert, params));
                }
                else {
                    promises.push(db.one(this.sqlInsert, params));
                }
            }
            // return the array of promised IBedesTermSectorLink objects.
            return Promise.all(promises);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error insert`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(items));
            throw error;
        }
    }

    /**
     * Delete a specific BedesTermSectorLink reference by id.
     */
    public async delete(item: IBedesTermSectorLink, transaction?: any): Promise<any> {
        try {
            if (!item._id) {
                logger.error(`${this.constructor.name}: Invalid parameters`);
                throw new Error('Invalid parameters');
            }
            const params = {
                _id: item._id
            };
            if (transaction) {
                return transaction.none(this.sqlDelete, params);
            }
            else {
                return db.none(this.sqlDelete, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in delete`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Delete all sector link entries for a given BedesTerm.
     */
    public async deleteByTermId(termId: number, transaction?: any): Promise<any> {
        try {
            if (!termId) {
                logger.error(`${this.constructor.name}: Invalid parameters`);
                throw new Error('Invalid parameters');
            }
            const params = {
                _termId: termId
            };
            if (transaction) {
                return transaction.none(this.sqlDeleteByTermId, params);
            }
            else {
                return db.none(this.sqlDeleteByTermId, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in delete by termId`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Updates the sectors for a bedesterm: deleteByTermId + insertAll
     */
    public async update(termId: number, sectors: Array<IBedesTermSectorLink>, transaction?: any) {
        try {
            if (!termId) {
                logger.error(`${this.constructor.name}: Invalid parameters, termId not defined.`);
                throw new Error('Invalid parameters');
            }
            // first remove the existing entries
            await this.deleteByTermId(termId, transaction);
            // write the new entries
            return this.insertAll(termId, sectors, transaction);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in update`);
            logger.error(util.inspect(error));
            throw error;
        }
    }



}
