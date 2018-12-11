import { Router } from 'express';
import * as handlers from './handlers';

function mountRoutes(router: Router) {
    router.get('/bedes-term/:id', handlers.getBedesTermHandler);
    router.get('/search-terms', handlers.searchBedesTermHandler);
    router.get('/data-type', handlers.getBedesDataTypeList);
    router.get('/term-category', handlers.getBedesTermCategoryList);
    router.get('/unit/:unitId/usage', handlers.unitHandler.getUnitUsageCount);
    router.get('/unit', handlers.unitHandler.getBedesUnitList);
    router.get('/support-lists', handlers.getSupportLists);
    router.get('/composite-term/:id', handlers.compositeTerm.get);
    router.post('/composite-term', handlers.compositeTerm.post);
}

export {
    mountRoutes
}
