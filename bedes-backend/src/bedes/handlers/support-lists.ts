import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { ISupportList } from '@bedes-common/interfaces/support-list';
import { bedesQuery } from '../query';
import { IBedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { IBedesUnit } from '@bedes-common/models/bedes-unit';
import { IBedesDataType } from '@bedes-common/models/bedes-data-type';
const logger = createLogger(module);

/**
 * Returns the various lists needed for use in the frontend as lookup tables.
 * @param request 
 * @param response 
 * @returns bedes term category list 
 */
export async function getSupportLists(request: Request, response: Response): Promise<any> {
    try {
        // create an array of promises, where each element is a promise returned
        // from the list building function.
        let promises = new Array<Promise<Array<IBedesTermCategory> | Array<IBedesUnit> | Array<IBedesDataType>>>();
        promises.push(bedesQuery.termCategory.getAllRecords());
        promises.push(bedesQuery.units.getAllRecords());
        promises.push(bedesQuery.dataType.getAllRecords());
        const [categoryList, unitList, dataTypeList] = await Promise.all(promises);
        response.json(<ISupportList>{
            _categoryList: categoryList,
            _unitList: unitList,
            _dataTypeList: dataTypeList
        });
    }
    catch (error) {
        logger.error('Error in getSupportLists');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode)
                .send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}

