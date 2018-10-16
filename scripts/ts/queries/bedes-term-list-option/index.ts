import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '../../../../bedes-backend/src/db';
import sql_loader from '../../../../bedes-backend/src/db/sql_loader';
import { logger } from '../../logging';
import * as util from 'util';
import { IBedesUnit } from '../../../../bedes-common/bedes-unit';
import { IBedesTerm, BedesTerm } from '../../../../bedes-common/bedes-term';
import { BedesTermOption, IBedesTermOption } from '../../../../bedes-common/bedes-term-option';

export class BedesTermListOptionQuery {
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

    public newRecord(termId: number, item: BedesTermOption): Promise<IBedesTermOption> {
        if (!item.name) {
            logger.error(`${this.constructor.name}: Missing name`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _termId: termId,
            _name: item.name,
            _description: item.description,
            _unitId: item.unitId,
            _definitionSourceId: item.definitionSourceId
        };
        return db.one(this.sqlInsert, params)
            .catch((error: Error) => {
                logger.error(`Error creating new bedes list option for term ${termId}`);
                logger.error(util.inspect(item));
                logger.error(util.inspect(error));
                throw error;
            });
    }

    /**
     * Gets BedesUnit record given a unit name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string): Promise<IBedesTerm> {
        if (!name) {
            logger.error(`${this.constructor.name}: Missing name`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: name
        };
        return db.oneOrNone(this.sqlGetByName, params);
    }

}
