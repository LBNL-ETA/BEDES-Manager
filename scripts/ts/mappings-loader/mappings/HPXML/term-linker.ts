import * as util from 'util';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { bedesQuery } from "@bedes-backend/bedes/query";
import { IAppTerm } from "@bedes-common/models/app-term";
import { IBedesTerm, IBedesConstrainedList } from "@bedes-common/models/bedes-term";
import { IMappedTerm, IAppTermMap, IBedesTermMap } from "@bedes-common/models/mapped-term";
import { BedesTermProcessor } from './bedes-term-processor';
import { AppTermProcessor } from './app-term-processor';
import { AppRow } from './app-row-hpxml';
import { BedesRow } from './bedes-row';

/**
 * Responsible for linking AppTerm objects for a given application to
 * BedesTerm objects.
 */
export class TermLinker {
    private bedesTermProcessor: BedesTermProcessor;
    private appTermProcessor: AppTermProcessor;
    private transaction: any;

    constructor() {
        this.bedesTermProcessor = new BedesTermProcessor();
        this.appTermProcessor = new AppTermProcessor();
    }

    /**
     * Set the transaction context for the queries to be run.
     * @param transaction 
     */
    public setTransaction(transaction: any): void {
        this.transaction = transaction;
        this.appTermProcessor.setTransaction(transaction);
        this.bedesTermProcessor.setTransaction(transaction);
    }

    /**
     * Links an apps terms to bedes terms.
     * @param appRows 
     * @param bedesRows 
     */
    public async linkTerms(appId: number, appRows: Array<AppRow>, bedesRows: Array<BedesRow>): Promise<any> {
        try {
            logger.debug('link terms');
            logger.debug(util.inspect(appRows));
            logger.debug(util.inspect(bedesRows));
            // transform the BedesRow objects to BedesTerm objects
            let bedesTerms = await this.bedesTermProcessor.transform(bedesRows);
            if (!bedesTerms.length) {
                // no bedes terms found, nothing to link
                logger.warn('bedes terms not found for appRow:');
                logger.warn(util.inspect(appRows));
                return;
            }
            // transform the AppRows to AppTerms
            let appTerms = this.appTermProcessor.transform(appId, appRows);
            if (!appTerms.length) {
                // Nothing was linked, even though there were AppRow and BedesRow objects.
                // May not be an error, e.g. section header in the spreadsheet or "No Mapping"
                logger.warn('app terms not found for appRow:');
                logger.warn(util.inspect(appRows));
                return;
            }
            // save the AppTerm objects to the database before linking to BedesTerm
            let savedAppTerms = await this.appTermProcessor.saveAppTerms(appTerms);
            logger.debug('app terms');
            logger.debug(util.inspect(bedesTerms));
            logger.debug(util.inspect(appTerms));
            return this.saveMappedTerm(appId, savedAppTerms, bedesTerms)
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in linkTerms`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appRows));
            logger.error(util.inspect(bedesRows));
            throw error;
        }
    }

    /**
     * Links the AppTerm objects in appTerms to the BedesTerm objects in bedesTerms,
     * producing a single MappedTerm object, which links the AppTerm and BedesTerm objects
     * into a single MappedTerm object.  IAppTerm and IBedesTerm objects must have been saved
     * to the database prior to linking the terms since the _id field is needed.
     * @param appTerms 
     * @param bedesTerms 
     * @returns linked terms 
     */
    public async saveMappedTerm(appId: number, appTerms: Array<IAppTerm>, bedesTerms: Array<IBedesTerm | IBedesConstrainedList>): Promise<IMappedTerm> {
        try {
            // create a new MappedTerm object
            let mappedTerm = <IMappedTerm>{
                _appId: appId,
                _appTerms: new Array<IAppTermMap>(),
                _bedesTerms: new Array<IBedesTermMap>()
            };
            // setup the order of terms in the term map
            let orderNumber = 1;
            // add the app terms, and set the name
            for (let appTerm of appTerms) {
                mappedTerm._appTerms.push(<IAppTermMap>{
                    _appTermId: appTerm._id,
                    _mappedTermId: undefined,
                    _orderNumber: orderNumber++
                });
            }
            // setup the order of terms in the term map
            orderNumber = 1;
            // add the bedes term, and set the bedes term name
            for (let bedesTerm of bedesTerms) {
                mappedTerm._bedesTerms.push(<IBedesTermMap>{
                    _bedesTermId: bedesTerm._id,
                    _mappedTermId: undefined,
                    _orderNumber: orderNumber++
                });
            }
            return bedesQuery.mappedTerm.newMappedTerm(mappedTerm, this.transaction);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in saveLinkedTerms`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appTerms));
            logger.error(util.inspect(bedesTerms));
            throw error;
        }
    }

}