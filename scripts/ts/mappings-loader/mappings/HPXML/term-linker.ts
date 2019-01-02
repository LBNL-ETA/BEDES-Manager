import * as util from 'util';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { bedesQuery } from "@bedes-backend/bedes/query";
import { IAppTerm } from "@bedes-common/models/app-term";
import { IBedesTerm, IBedesConstrainedList } from "@bedes-common/models/bedes-term";
import { IMappedTerm, IAppTermMap, IBedesAtomicTermMap } from "@bedes-common/models/mapped-term";
import { BedesTermProcessor } from './bedes-term-processor';
import { AppTermProcessor } from './app-term-processor';
import { AppRow } from './app-row-hpxml';
import { BedesRow } from './bedes-row';
import { BedesCompositeTerm } from '../../../../../bedes-common/models/bedes-composite-term/bedes-composite-term';
import { buildCompositeTermFromInterface } from '@bedes-common/util/build-composite-term';
import { IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term.interface';
import { BedesErrorTermNotFound } from '../lib/errors/bedes-term-not-found.error';
import { IBedesCompositeTermMap } from '@bedes-common/models/mapped-term/bedes-composite-term-map.interface';

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
            let [transformResults, bedesUnit] = await this.bedesTermProcessor.transform(bedesRows);
            if (!transformResults.length) {
                // no bedes terms found, nothing to link
                logger.debug('bedes terms not found for appRow:');
                logger.debug(util.inspect(appRows));
                return;
            }
            // if there's more than 1 bedes term in the mapping, it's a composite term
            let compositeTerm: BedesCompositeTerm | undefined;
            let savedCompositeTerm: IBedesCompositeTerm | undefined;

            // handle composite terms here
            // if there's more than 1 term, then it's a composite term
            // first check if one already exists with the given signature
            // if not create the composite term
            if (transformResults.length > 1) {
                compositeTerm = buildCompositeTermFromInterface(transformResults, bedesUnit);
                logger.debug('built composite term...');
                logger.debug(util.inspect(compositeTerm));
                // save the composite term
                // look for an existing composite term
                let existing = await bedesQuery.compositeTerm.getRecordBySignature(compositeTerm.signature, this.transaction);
                if (existing) {
                    // assign the existing record to the composite term we're linking to the app terms
                    savedCompositeTerm = existing;
                }
                else {
                    try {
                        // otherwise, save a new composite term and wait for results
                        savedCompositeTerm = await bedesQuery.compositeTerm.newCompositeTerm(compositeTerm.toInterface(), this.transaction)
                    }
                    catch (error) {
                        if (!(error instanceof BedesErrorTermNotFound)) {
                            logger.error('An error occured savings the composite term');
                            logger.error(util.inspect(error));
                            logger.error(util.inspect(compositeTerm));
                            throw error;
                        }
                    }
                }
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
            logger.debug(util.inspect(transformResults));
            logger.debug(util.inspect(appTerms));
            // either save the mapped app terms against a Bedes Atomic or Bedes Composite Term.
            if (savedCompositeTerm) {
                // if there's a composite term object, it's a composite term
                return this.saveMappedCompositeTerm(appId, savedAppTerms, savedCompositeTerm);
            }
            else {
                // an atomic term will have a single bedes term
                // first element of the transform is the bedes term object
                return this.saveMappedAtomicTerm(appId, savedAppTerms, transformResults[0][0]);
            }
        } catch (error) {
            if (!(error instanceof BedesErrorTermNotFound)) {
                logger.error(`${this.constructor.name}: Error in linkTerms`);
                logger.error(util.inspect(error));
                logger.error(util.inspect(appRows));
                logger.error(util.inspect(bedesRows));
            }
            throw error;
        }
    }

    public async saveMappedAtomicTerm(appId: number, appTerms: Array<IAppTerm>, bedesTerm: IBedesTerm | IBedesConstrainedList) {
        try {
            // create a new MappedTerm object
            let mappedTerm: IMappedTerm = {
                _appId: appId,
                _appTerms: new Array<IAppTermMap>(),
                _bedesTerm: <IBedesAtomicTermMap>{
                    _bedesTermId: bedesTerm._id
                }
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
            return bedesQuery.mappedTerm.newMappedTerm(mappedTerm, this.transaction);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in saveMappedAtomicTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appTerms));
            logger.error(util.inspect(bedesTerm));
            throw error;
        }
    }

    public async saveMappedCompositeTerm(appId: number, appTerms: Array<IAppTerm>, compositeTerm: IBedesCompositeTerm) {
        try {
            if (!compositeTerm._id) {
                logger.error(`${this.constructor.name}: saveMappedCompositeTerm expends a BedesCompositeTerm with an id, none found`);
                throw new Error(`${this.constructor.name}: saveMappedCompositeTerm expends a BedesCompositeTerm with an id, none found`);
            }
            // create a new MappedTerm object
            let mappedTerm: IMappedTerm = {
                _appId: appId,
                _appTerms: new Array<IAppTermMap>(),
                _bedesTerm: <IBedesCompositeTermMap> {
                    _compositeTermId: compositeTerm._id,
                }
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
            return bedesQuery.mappedTerm.newMappedTerm(mappedTerm, this.transaction);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in saveMappedCompositeTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appTerms));
            logger.error(util.inspect(compositeTerm));
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
    // public async saveMappedTerm(appId: number, appTerms: Array<IAppTerm>,
    //                             bedesTerms: Array<IBedesTerm | IBedesConstrainedList>): Promise<IMappedTerm> {
    //     try {
    //         // create a new MappedTerm object
    //         let mappedTerm = <IMappedTerm>{
    //             _appId: appId,
    //             _appTerms: new Array<IAppTermMap>(),
    //             _bedesTerms: new Array<IBedesAtomicTermMap>()
    //         };
    //         // setup the order of terms in the term map
    //         let orderNumber = 1;
    //         // add the app terms, and set the name
    //         for (let appTerm of appTerms) {
    //             mappedTerm._appTerms.push(<IAppTermMap>{
    //                 _appTermId: appTerm._id,
    //                 _mappedTermId: undefined,
    //                 _orderNumber: orderNumber++
    //             });
    //         }
    //         // setup the order of terms in the term map
    //         orderNumber = 1;
    //         // add the bedes term, and set the bedes term name
    //         for (let bedesTerm of bedesTerms) {
    //             mappedTerm._bedesTerms.push(<IBedesAtomicTermMap>{
    //                 _bedesTermId: bedesTerm._id,
    //                 _mappedTermId: undefined,
    //                 _orderNumber: orderNumber++
    //             });
    //         }
    //         return bedesQuery.mappedTerm.newMappedTerm(mappedTerm, this.transaction);
    //     }
    //     catch (error) {
    //         logger.error(`${this.constructor.name}: Error in saveLinkedTerms`);
    //         logger.error(util.inspect(error));
    //         logger.error(util.inspect(appTerms));
    //         logger.error(util.inspect(bedesTerms));
    //         throw error;
    //     }
    // }

}