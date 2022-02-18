import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../query';
const logger = createLogger(module);

/**
 * Route handler for the BedesTerm search.
 */
export async function searchBedesTermHandler(request: Request, response: Response): Promise<any> {
    try {
        const searchTerms = buildSearchParams(request.query.search);
        if (!searchTerms.length) {
            throw new BedesError(
                'Missing search term',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        const includePublic = request.query.includePublic ? !!+request.query.includePublic : false;
        const includeComposite = request.query.includeComposite ? !!+request.query.includeComposite : true;
        const includeListOptions = request.query.includeListOptions ? !!+request.query.includeListOptions : true;
        let results = await bedesQuery.bedesTermSearch.searchAllBedesTerms(request, includePublic, includeComposite, includeListOptions, searchTerms);
        response.json(results);
    }
    catch (error) {
        logger.error('Error in searchBedesTermHandler');
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

function buildSearchParams(query: any): Array<string> {
    try {
        const searchTerms = new Array<string>();
        if (query instanceof Array) {
            query.map((d) => searchTerms.push(d));
        }
        else if (typeof query === 'string') {
            searchTerms.push(query);
        }
        return searchTerms;
    }
    catch (error) {
        logger.error('Error parsing bedes search query terms');
        throw new BedesError(
            'Error parsing bedes query',
            HttpStatusCodes.ServerError_500,
            'Error parsing query.'
        );
    }
}
