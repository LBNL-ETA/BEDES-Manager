import { TermType } from '@bedes-common/enums/term-type.enum';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '../../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../../bedes-common/enums/http-status-codes';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { BedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit';
import { IBedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit.template';
const logger = createLogger(module);

export interface IAppTermCsvRow {
    TermName: string;
    Description?: string | null | undefined;
    TermType: string;
    Unit?: string | null | undefined;
    /** The first the list option's name */
    ListOptionName?: string | null | undefined;
    /** The first the list option's description. */
    ListOptionDescription?: string | null | undefined;
    /**
     * papaparse puts the columns without a header in here,
     * so this is an array of list option name as one array element,
     * and that list options description as the following array element.
     * 
     * @example
     * ['list option name 1', 'description 1', 'option 2', 'description 2', 'option 3', ...]
     *  */
    __parsed_extra?: Array<string> | null | undefined;
}

/**
 * Determines whether the given IAppTermCsvRow object,
 * an object returned as a parsed row from an input application term
 * input csv file, is a valid term.
 * @param item The IAppTermCsvRow object whose validity is being determined.
 * @returns true if there's enough information to build an AppTerm or AppTermList
 */
export function isValidAppTermCsvRow(item: IAppTermCsvRow): boolean {
        if (item && item.TermName && item.TermType) {
            return true;
        }
        else {
            return false;
        }
}

export function getTermTypeFromCsvName(termTypeString: string): TermType {
    try {
        if (typeof termTypeString !== 'string') {
            logger.error(`getTermTypeFromCsvName: invalid term type (${termTypeString})`);
            throw new Error('Invalid term type')
        }
        else if (termTypeString.toLowerCase().trim() === '[value]') {
            return TermType.Atomic;
        }
        else if (termTypeString.toLowerCase().trim() === 'constrained list') {
            return TermType.ConstrainedList;
        }
        else {
            logger.error(`getTermTypeFromCsvName: invalid term type (${termTypeString})`);
            throw new Error('Invalid term type')
        }
    }
    catch(error) {
        logger.error(`getTermTypeFromCsvName: error in getTermType`)
        throw error;
    }
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
            throw new Error('Unkown eror retrieving unit record')
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