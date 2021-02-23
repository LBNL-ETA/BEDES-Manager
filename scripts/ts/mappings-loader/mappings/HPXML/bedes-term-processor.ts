import * as util from 'util';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { bedesQuery } from "@bedes-backend/bedes/query";
import { BedesRow } from "./bedes-row";
import { IBedesConstrainedList, IBedesTerm } from "@bedes-common/models/bedes-term";
import { BedesMappingLabel } from '../base/bedes-mapping-label';
import { BedesErrorTermNotFound } from '@bedes-common/errors/bedes-term-not-found.error';
import { BedesTerm } from '../../../../../bedes-common/models/bedes-term/bedes-term';
import { BedesDataType } from '@bedes-common/enums';
import { BedesTermOption } from '../../../../../bedes-common/models/bedes-term-option/bedes-term-option';
import { IBedesTermOption } from '../../../../../bedes-common/models/bedes-term-option/bedes-term-option.interface';
import { BedesTransformResultType } from '../common/bedes-transform-result.type';
import { IBedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit.template';

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
    public async transform(bedesRows: Array<BedesRow>): Promise<[Array<BedesTransformResultType>, IBedesUnit | undefined]> {
        try {
            const validMappings = new Array<BedesMappingLabel>();
            const results = new Array<BedesTransformResultType>();
            let unit: IBedesUnit | undefined;
            for (let bedesRow of bedesRows) {
                // skip invalid empty mapping texts
                if (!bedesRow.bedesMapping) {
                    continue;
                }
                // find the unit_id if it's there
                if (bedesRow.bedesUnit) {
                    try {
                        unit = await bedesQuery.units.getRecordByName(bedesRow.bedesUnit.trim(), this.transaction)
                        console.log('** find unit');
                        console.log(unit);
                    }
                    catch (error) {
                        const newUnit: IBedesUnit = {_id: undefined, _name: bedesRow.bedesUnit.trim()};
                        unit = await bedesQuery.units.newRecord(newUnit, this.transaction);
                        logger.debug(`unable to find unit ${bedesRow.bedesUnit}`);
                        // throw error
                    }
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
                    // skip blank mappings
                    if (!mapping) {
                        continue;
                    }
                    validMappings.push(mapping);
                    // determine if the term is a constrained list or regular term
                    // let result = await bedesQuery.terms.isConstrainedList(mapping.termName);
                    // const term = await bedesQuery.terms.getRecordByName(mapping.termName);
                    let term: IBedesTerm
                    try {
                        term = await bedesQuery.terms.getRecordByName(mapping.termName);
                    }
                    catch (error) {
                        logger.error(`${this.constructor.name}: couldn't find BedesTerm`);
                        console.log(mapping);
                        if (error.name === 'QueryResultError') {
                            throw new BedesErrorTermNotFound(mapping.termName);
                        }
                        else {
                            throw error;
                        }
                    }
                    // create a term option
                    let termOption: IBedesTermOption | undefined;
                    // if the term is a constrained list, get the list option
                    if (term._dataTypeId === BedesDataType.ConstrainedList && term._uuid && !mapping.isValueField()) {
                        try {
                            termOption = await bedesQuery.termListOption.getRecordByName(term._uuid, mapping.value);
                        }
                        catch (error) {
                            logger.warn(`Term option ${mapping.value} not found for bedes term ${term._name} (${term._id})`)
                        }
                    }
                    results.push([term, termOption, mapping]);
                }
            }
            return [results, unit];
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
