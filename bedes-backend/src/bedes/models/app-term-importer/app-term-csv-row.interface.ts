import { TermType } from '@bedes-common/enums/term-type.enum';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '../../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../../bedes-common/enums/http-status-codes';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { BedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit';
import { IBedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit.template';
const logger = createLogger(module);

/**
 * Note
 * 1. CSV should contain ApplicationTerm and BEDESCompositeTerm for all rows.
 *      (for no mapping, put 'NO MAPPING' in BEDESCompositeTerm column)
 */

var delimiter: string = '\n';

export interface IAppTermCsvRow {

    ApplicationTerm: string;
    ApplicationTermDescription?: string | null | undefined;
    ApplicationTermUnit?: string | null | undefined;
    ApplicationTermDataType?: string | null | undefined;

    BedesTerm?: string | null | undefined;
    BedesTermDescription?: string | null | undefined;
    BedesTermUnit?: string | null | undefined;
    BedesTermDataType?: string | null | undefined;

    BedesAtomicTermMapping?: string | null | undefined;
    BedesConstrainedListMapping?: string | null | undefined;

    BedesCompositeTermUUID?: string | null | undefined;
    BedesAtomicTermUUID?: string | null | undefined;
    BedesConstrainedListOptionUUID?: string | null | undefined;

}

/**
 * Determines whether the given IAppTermCsvRow object,
 * an object returned as a parsed row from an input application term
 * input csv file, is a valid term.
 * @param item The IAppTermCsvRow object whose validity is being determined.
 * @returns true if there's enough information to build an AppTerm or AppTermList
 */
export function isValidAppTermCsvRow(item: IAppTermCsvRow): boolean {
    if (item && item.ApplicationTerm) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * Determines whether a term has a mapping to a BEDES term or not.
 * @param item
 * @returns true if there's no mapping.
 */
export function termhasNoMapping(item: IAppTermCsvRow): boolean {
    if (!item.BedesAtomicTermUUID || !item.BedesCompositeTermUUID || !item.BedesTerm) {
        return true;
    } else {
        return false;
    }
}

/**
 * Determines whether a term has a mapping to a BEDES term or not.
 * @param item
 * @returns true if there is mapping.
 */
export function termhasMapping(item: IAppTermCsvRow): boolean {
    if (item.BedesAtomicTermUUID && item.BedesCompositeTermUUID && item.BedesTerm) {
        return true;
    } else {
        return false;
    }
}

/**
 * Determines the TermType based on the BedesConstrainedListOptionUUID.
 * If len(BedesConstrainedListOptionUUID) == 1 then TermType = Atomic, Else Constrained List
 * [Note] If it is null, then function returns TermType=Atomic.
 * @param termTypeString BedesConstrainedListOptionUUID string
 */
export function getTermTypeFromCsvName(item: IAppTermCsvRow): TermType {

    try {

        if (!item.BedesConstrainedListMapping && !item.BedesConstrainedListOptionUUID) {
            return TermType.Atomic;
        }

        if (!item.BedesConstrainedListMapping || !item.BedesConstrainedListOptionUUID) {
            logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
            throw new Error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
        }

        let numBedesConstrainedListMapping: Array<string> =  item.BedesConstrainedListMapping.trim().split(delimiter);
        let numBedesConstrainedListOptionUUIDs: Array<string> =  item.BedesConstrainedListOptionUUID.trim().split(delimiter);

        if (numBedesConstrainedListMapping.length != numBedesConstrainedListOptionUUIDs.length) {

            // "Other" is a generic list option that can be added to any constrained list, and so does not have
            // an assigned UUID.
            if (!numBedesConstrainedListMapping[numBedesConstrainedListMapping.length - 1].toLowerCase().includes('other')) {
                logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
                throw new Error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
            }
        }

        if (numBedesConstrainedListMapping.length < 2) {
            logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs need to have more than 1 option.`);
            throw new Error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs need to have more than 1 option.`);
        }

        return TermType.ConstrainedList;

    } catch (error) {
        throw error;
    }

    // try {
    //     if (typeof termTypeString !== 'string') {
    //         logger.error(`getTermTypeFromCsvName: invalid term type (${termTypeString})`);
    //         throw new Error('Invalid term type')
    //     }
    //     else if (termTypeString.toLowerCase().trim() === '[value]') {
    //         return TermType.Atomic;
    //     }
    //     else if (termTypeString.toLowerCase().trim() === 'constrained list') {
    //         return TermType.ConstrainedList;
    //     }
    //     else {
    //         logger.error(`getTermTypeFromCsvName: invalid term type (${termTypeString})`);
    //         throw new Error('Invalid term type')
    //     }
    // }
    // catch(error) {
    //     logger.error(`getTermTypeFromCsvName: error in getTermType`)
    //     throw error;
    // }
}

/**
 * Retrieves the unit id from the given unit name.
 *
 * @param unitName The name of the unit name to query the database.
 * @returns A Promise which resolves to the id of the found unit.
 */
export async function getUnitIdFromName(unitName: string, trans?: any): Promise<number> {
    try {
        if (typeof unitName !== 'string' || !unitName.trim()) {
            throw new BedesError(
                'Unit name ${unitName} not found.',
                HttpStatusCodes.BadRequest_400
            )
        }
        let unit: IBedesUnit | undefined;
        try {
            unit = await bedesQuery.units.getRecordByName(unitName.trim(), trans);
        } catch (error) {
            throw new BedesError(
                `Unit ${unitName} doesn't exist.`,
                HttpStatusCodes.BadRequest_400
            );
        }

        // if (!unit || !unit._id) {
        //     // unit doesn't exist... create it
        //     const params: IBedesUnit = {
        //         _id: undefined,
        //         _name: unitName.trim()
        //     }
        //     unit = await bedesQuery.units.newRecord(params, trans)
        // }
        if (!unit._id) {
            throw new Error('Unknown error retrieving unit record')
        }
        else {
            return unit._id;
        }
    }
    catch (error) {
        logger.error('getUnitIdFromName: Error finding matching unit.');
        throw error;
    }
}

/**
 * Returns true if the application term is mapped to a BEDES Atomic Term.
 * @param BedesAtomicTermUUID
 * @param BedesCompositeTermUUID
 */
export function mappedToBedesAtomicTerm(item: IAppTermCsvRow): boolean {
    if (item.BedesAtomicTermUUID == item.BedesCompositeTermUUID) {
        return true;
    } else {
        return false;
    }
}

/**
 * Returns true if the application term is mapped to a BEDES Composite Term.
 * @param BedesAtomicTermUUID
 * @param BedesCompositeTermUUID
 */
export function mappedToBedesCompositeTerm(item: IAppTermCsvRow): boolean {

    let numBedesAtomicTermUUID: Array<string> =  item.BedesAtomicTermUUID!.trim().split(delimiter);
    let numBedesCompositeTermUUID: Array<string> =  item.BedesCompositeTermUUID!.trim().split(delimiter);

    if (numBedesAtomicTermUUID.length <= numBedesCompositeTermUUID.length) {
        logger.error(`#BedesAtomicTermUUIDs is less than or equal to #BedesCompositeTermUUIDs.`);
        throw new Error(`#BedesAtomicTermUUIDs is less than or equal to #BedesCompositeTermUUIDs.`);
    }

    return true;
}
