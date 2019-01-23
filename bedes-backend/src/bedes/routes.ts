import { Router } from 'express';
import * as handlers from './handlers';

function mountRoutes(router: Router) {
    router.get('/bedes-term/:id', handlers.getBedesTermHandler);
    router.post('/bedes-term', handlers.getBedesTermsMultipleHandler);
    // BedesSearch
    router.get('/search-terms', handlers.searchBedesTermHandler);
    router.get('/data-type', handlers.getBedesDataTypeList);
    router.get('/term-category', handlers.getBedesTermCategoryList);
    // Units
    router.get('/unit/:unitId/usage', handlers.unitHandler.getUnitUsageCount);
    router.get('/unit', handlers.unitHandler.getBedesUnitList);
    // SupportLists
    router.get('/support-lists', handlers.getSupportLists);
    // MappingApplication
    router.get('/mapping-application', handlers.applications.getApplicationsHandler);
    router.post('/mapping-application', handlers.applications.newMappingApplicationHandler);
    router.put('/mapping-application', handlers.applications.updateMappingApplicationHandler);
    router.delete('/mapping-application/:id', handlers.applications.deleteMappingApplicationHandler);
    // Mapping Application Terms
    router.post('/mapping-application/:id/term', handlers.appTerm.insertAppTermHandler);
    router.get('/mapping-application/:id/term', handlers.appTerm.getAppTermsHandler);
    router.get('/mapping-application/term/:id', handlers.appTerm.getAppTermHandler);
    router.get('/mapping-application/sibling/:id', handlers.appTerm.getAppTermsSiblingHandler);
    // Composite Terms
    router.get('/composite-term/:id', handlers.compositeTerm.get);
    router.get('/composite-term', handlers.compositeTerm.getAll);
    router.post('/composite-term', handlers.compositeTerm.post);
    // BedesTermOption
    router.post('/bedes-term-list-option', handlers.bedesTermListOption.newListOptionHandler);
    router.put('/bedes-term-list-option/:id', handlers.bedesTermListOption.updateListOptionHandler);
    router.delete('/bedes-term-list-option/:id', handlers.bedesTermListOption.deleteListOptionHandler);
}

export {
    mountRoutes
}
