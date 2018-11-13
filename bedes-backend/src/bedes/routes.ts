import { Router } from 'express';
import * as handlers from './handlers';

function mountRoutes(router: Router) {
    /**
     * @swagger
     *
     * /api/search-term/{searchString}:
     *   get:
     *     description: Searches the Bedes database for term matching the pattern searchString.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: projectId
     *         description: The projectId of the ePB Project.
     *         required: true
     *         type: integer
     *         in: path
     *     responses:
     *       200:
     *         description: Project successfully deleted.
     *       400:
     *         description: Bad request, client side issue.
     *       401:
     *         description: User not authorized.
     *       404:
     *         description: Invalid API endpoint.
     *       500:
     *         description: Server error.
     * 
     */
    router.get('/bedes-term/:id', handlers.getBedesTermHandler);
    router.get('/search-terms', handlers.searchBedesTermHandler);
    router.get('/data-type', handlers.getBedesDataTypeList);
    router.get('/term-category', handlers.getBedesTermCategoryList);
    router.get('/unit', handlers.getBedesUnitList);
    router.get('/support-lists', handlers.getSupportLists);
}

export {
    mountRoutes
}
