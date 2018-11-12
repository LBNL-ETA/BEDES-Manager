import * as util from 'util';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { bedesQuery } from "@bedes-backend/bedes/query";
import { BedesRow } from "./bedes-row";
import { IBedesConstrainedList, IBedesTerm } from "@bedes-common/models/bedes-term";
import { BedesMappingLabel } from '../base/bedes-mapping-label';

/**
 * Bedes term processor: it processes a collection of BedesRow objects,
 * and transforms them into  BedesTerm/BedesConstrainedList objects.
 */
export class BedesTermProcessor {
    private transaction: any;

    constructor(
    ) { }

    /**
     * Set the transaction context for the queries to be run.
     * @param transaction 
     */
    public setTransaction(transaction: any): void {
        this.transaction = transaction;
    }

    /**
     * Takes the passed in collection of BedesRow objects, and transforms them into
     * BedesTerm objects.
     * @param bedesRows 
     * @returns transform 
     */
    public async transform(bedesRows: Array<BedesRow>): Promise<Array<IBedesTerm | IBedesConstrainedList>> {
        try {
            let promises = new Array<Promise<IBedesTerm | IBedesConstrainedList>>();
            for (let bedesRow of bedesRows) {
                // skip invalid empty mapping texts
                if (!bedesRow.bedesMapping) {
                    continue;
                }
                // parse the bedes mapping text into an array of
                // "termName=value" array items (can have multiple definitions in 1 cell)
                let mappings = this.parseBedesMappingText(bedesRow.bedesMapping);
                // skip invalid mapping texts
                if (!mappings) {
                    logger.warn('Invalid mapping text encountered:');
                    logger.warn(util.inspect(bedesRow));
                    continue;
                }
                for (let mapping of mappings) {
                    if (mapping) {
                        // check if the term is a constrained list or regular term
                        let result = await bedesQuery.terms.isConstrainedList(mapping.termName);
                        if (result) {
                            // term is a constrained list
                            // if constrained list, and [value], then this is a custom value for the list
                            if (mapping.value === '[value]') {
                                mapping.value = 'Custom';
                            }
                            // set all values to custom
                            // TODO: Revisit this to handle vaues correctly
                            mapping.value = 'Custom';
                            promises.push(bedesQuery.terms.getConstrainedList(mapping.termName, mapping.value, this.transaction));
                        }
                        else {
                            // Regular BedesTerm, ie not a ConstrainedList
                            promises.push(bedesQuery.terms.getRecordByName(mapping.termName, this.transaction));
                        }
                    }
                }
            }
            return Promise.all(promises);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in transform`);
            logger.error(util.inspect(error));
            logger.error(`couldn't find matching bedes terms`);
            logger.error(util.inspect(bedesRows));
            throw error;
        }
    }

    /**
     * Parses the bedes mapping text, which lists the Bedes Term name and value,
     * and returns an array of mapping lablels (eg Construction Status=[value]).
     * @param mappingText 
     * @returns bedes mapping text 
     */
    private parseBedesMappingText(mappingText: string): Array<BedesMappingLabel> | undefined {
        try {
            if (!mappingText) {
                return undefined;
            }
            // there can be multiple mappings in one cell
            // so split by linefeed
            let terms = mappingText.split(/\n/);
            // holds all the parse labels
            let labels = new Array<BedesMappingLabel>();
            // loop through each term in the label
            terms.forEach((mappingText) => {
                // ignore blank lines
                if (mappingText && mappingText.trim()) {
                    // mapping labels for HPXML look like:
                    // Telephone Number=[value]
                    // parse out the term name and value
                    let results = mappingText.match(/(.*[^ ]) ?= ?['"]?(.*[^'"])['"]?/);
                    if (results && results.length === 3) {
                        // bedes term name is the first captured group
                        // term value is the second captured group
                        labels.push(new BedesMappingLabel(results[1], results[2]));
                    }
                    else {
                        logger.debug(`${this.constructor.name}: invalid BedesMappingLabel`);
                        logger.debug(mappingText);
                        throw new Error('Invalid BedesMappingLabel');
                    }
                }
            });
            return labels;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in parseBedesMappingText`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(mappingText));
            throw error;
        }
    }


}