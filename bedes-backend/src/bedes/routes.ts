import { Router } from 'express';
import * as handlers from './handlers';
import { uploadMiddleware } from './uploads';

function mountRoutes(router: Router) {
    router.get('/bedes-term/:id', handlers.getBedesTermHandler);
    router.get('/bedes-term', handlers.bedesTerm.getTermListHandler);
    router.post('/bedes-term', handlers.bedesTerm.newBedesTermHandler);
    // router.put('/bedes-term', handlers.bedesTerm.updateBedesTermHandler);
    // router.delete('/bedes-term/:id', handlers.deleteBedesTermHandler);
    router.post('/get-bedes-terms', handlers.getBedesTermsMultipleHandler);
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
    router.put('/mapping-application/:appId/term/:appTermId', handlers.appTerm.updateAppTermHandler);
    router.delete('/mapping-application/:appId/term/:appTermId', handlers.appTerm.deleteAppTermHandler);
    router.get('/mapping-application/:id/term', handlers.appTerm.getAppTermsHandler);
    router.get('/mapping-application/term/:id', handlers.appTerm.getAppTermHandler);
    router.get('/mapping-application/sibling/:id', handlers.appTerm.getAppTermsSiblingHandler);
    // AppTerm Imports
    router.post('/mapping-application/:id/import', uploadMiddleware, handlers.appTermImportHandler);
    // AppTerm Exports
    router.get('/mapping-application/:id/export', handlers.appTermExportHandler);
    // AppTermListOption
    router.post('/app-term/:appTermId/list-option', handlers.appTermListOption.newListOptionHandler);
    router.delete('/app-term-list-option/:id', handlers.appTermListOption.deleteListOptionHandler);
    router.put('/app-term-list-option/:id', handlers.appTermListOption.updateListOptionHandler);
    // Composite Terms
    router.get('/composite-term/:id', handlers.compositeTerm.get);
    router.get('/composite-term', handlers.compositeTerm.getAll);
    router.post('/composite-term', handlers.compositeTerm.post);
    router.put('/composite-term/:id', handlers.compositeTerm.put);
    router.delete('/composite-term/:id', handlers.compositeTerm.delete);
    router.post('/composite-term/detail-info', handlers.compositeTerm.getDetailInfo);
    router.delete('/composite-term-detail/:id', handlers.compositeTerm.deleteDetail);
    // BedesTermOption
    router.post('/bedes-term-list-option', handlers.bedesTermListOption.newListOptionHandler);
    router.put('/bedes-term-list-option/:id', handlers.bedesTermListOption.updateListOptionHandler);
    router.delete('/bedes-term-list-option/:id', handlers.bedesTermListOption.deleteListOptionHandler);
}

export {
    mountRoutes
}
