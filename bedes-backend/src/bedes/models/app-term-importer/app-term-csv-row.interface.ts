import { TermType } from '@bedes-common/enums/term-type.enum';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '../../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../../bedes-common/enums/http-status-codes';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesTerm, IBedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit';
import { IBedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit.template';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option';
import { bedesTerm } from '@bedes-backend/bedes/handlers';
const logger = createLogger(module);

/**
 * TODO
 * 1. Rewrite docstrings of all functions (many are wrong)
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

    // TODO: Check if the case where the delimiter is something other than \n will work or not.
    try {
        if (item.BedesConstrainedListMapping && item.BedesConstrainedListOptionUUID) {
            let numBedesConstrainedListMapping: Array<string> =  item.BedesConstrainedListMapping.trim().split(delimiter);
            let numBedesConstrainedListOptionUUIDs: Array<string> =  item.BedesConstrainedListOptionUUID.trim().split(delimiter);
            if (numBedesConstrainedListMapping.length != numBedesConstrainedListOptionUUIDs.length) {
                // "Other" is a generic list option that can be added to any constrained list, and so does not have
                // an assigned UUID.
                // TODO: Update if statement condition to numBCLM[numBCLM.length - 1].split("=")[1] == 'other'            
                if (!numBedesConstrainedListMapping[numBedesConstrainedListMapping.length - 1].toLowerCase().includes('other')) {
                    logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
                    throw new Error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
                }
            }
            // TODO: Double check if this is true.
            if (numBedesConstrainedListMapping.length < 2) {
                logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs need to have more than 1 option.`);
                throw new Error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs need to have more than 1 option.`);
            }
            return TermType.ConstrainedList;
        } else if (item.BedesConstrainedListMapping && !item.BedesConstrainedListOptionUUID) {
            return TermType.ConstrainedList;
        } else if (item.BedesConstrainedListOptionUUID && !item.BedesConstrainedListMapping) {
            logger.error(`BedesConstrainedListMapping is missing.`);
            throw new Error(`BedesConstrainedListMapping is missing.`);
        }
        // If !item.BedesConstrainedListOptionUUID && !item.BedesConstrainedListMapping then,
        return TermType.Atomic;
    } catch (error) {
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
            if (unit._id) {
                return unit._id;
            } else {
                throw new Error('Error retrieving unit ID of BEDES Term');
            }
        } catch (error) {
            throw new BedesError(
                `Unit ${unitName} doesn't exist.`,
                HttpStatusCodes.BadRequest_400
            );
        }
    }
    catch (error) {
        logger.error('getUnitIdFromName: Error finding matching unit.');
        throw error;
    }
}

/**
 * Determines whether a term has a mapping to a BEDES term or not.
 * @param item
 * @returns true if there's no mapping.
 */
export function termhasNoMapping(item: IAppTermCsvRow): boolean {

    if (!item.BedesTerm) {
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
    if (item.BedesAtomicTermMapping) {
        return true;
    } else {
        return false;
    }
}

/**
 * Returns true if the application term is mapped to a BEDES Atomic Term.
 * @param BedesAtomicTermUUID
 * @param BedesCompositeTermUUID
 * @returns true if it is mapped to a BEDES Atomic Term
 */
export async function mappedToBedesAtomicTerm(item: IAppTermCsvRow): Promise<boolean> {

    // TODO: Check if the case where the delimiter is something other than \n will work or not.
    let bedesAtomicTermMappings: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);
    if (bedesAtomicTermMappings.length == 1) {
        
        let termValue: Array<string> = bedesAtomicTermMappings[0].trim().split("=");
        if (termValue.length == 2 && termValue[1].trim() == '[value]') {
            var uuid: string = '';
            if (item.BedesAtomicTermUUID && item.BedesCompositeTermUUID) {
                if (item.BedesAtomicTermUUID == item.BedesCompositeTermUUID) {
                    uuid = item.BedesAtomicTermUUID;
                } else {
                    throw new Error('For BEDES Atomic Term, AtomicTermUUID and CompositeTermUUID must be equal.');
                }
            } else {
                if (item.BedesAtomicTermUUID) {
                    uuid = item.BedesAtomicTermUUID;
                } else if (item.BedesCompositeTermUUID) {
                    uuid = item.BedesCompositeTermUUID;
                }
            }

            var bedesTerm: IBedesTerm = await bedesQuery.terms.getRecordByName(item.BedesTerm!);
            if (uuid) {
                if (bedesTerm._uuid != uuid) {
                    throw new Error('Incorrect BedesTerm UUID.');
                }
            }
            
            // Validate constrained list mappings
            if (item.BedesConstrainedListMapping) {
                var bedesConstrainedListUUIDs: Array<string> = [];
                let bedesConstrainedListMappings: Array<string> = item.BedesConstrainedListMapping!.trim().split(delimiter);
                if (item.BedesConstrainedListOptionUUID) {
                    bedesConstrainedListUUIDs = item.BedesConstrainedListOptionUUID.trim().split(delimiter);
                    if (bedesConstrainedListMappings.length != bedesConstrainedListUUIDs.length) {
                        throw new Error('#BEDESConstrainedListMappings and #BEDESConstrainedListUUIDs do not match');
                    }
                }
                let termUUID: string = item.BedesAtomicTermUUID ? item.BedesAtomicTermUUID : bedesTerm._uuid!;
                for (let i = 0; i < bedesConstrainedListMappings.length; i += 1) {
                    let termValue: Array<string> = bedesConstrainedListMappings[i].trim().split("=");
                    let result = await bedesQuery.termListOption.getRecordByName(termUUID, termValue[1].trim());
                    if (bedesConstrainedListUUIDs && result._uuid != bedesConstrainedListUUIDs[i]) {
                        throw new Error('Incorrect BEDESConstrainedListMappingUUID.');
                    }
                }
            }
        } else {
            // TODO: Change error message.
            throw new Error('BedesAtomicTerm with one term value should be equal to [value]');
        }
        return true;
    }
    return false;
}

export function capitalizeEachWord(str: string) {
    let temp = str.split(" ");
    for (let j = 0; j < temp.length; j += 1) {
        temp[j] = temp[j][0].toUpperCase() + temp[j].substr(1);
    }
    return temp.join(" ");
}

/**
 * Returns true if the application term is mapped to a BEDES Composite Term.
 * @param item The IAppTermCsvRow object whose validity is being determined.
 */
export async function mappedToBedesCompositeTerm(item: IAppTermCsvRow): Promise<boolean> {

    // NOTE: item.BedesAtomicTermUUID IS THE UUID OF THE LIST OPTION NOT THE TERM ITSELF!

    var compositeTermMappings: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);

    // The last mapping should be "x=[value]"
    if (compositeTermMappings[compositeTermMappings.length - 1].split("=")[1].trim() == '[value]') {

        if (item.BedesAtomicTermUUID) {
            var numBedesAtomicTermUUID: Array<string> =  item.BedesAtomicTermUUID!.trim().split(delimiter);
            if (item.BedesCompositeTermUUID) {
                var numBedesCompositeTermUUID: Array<string> =  item.BedesCompositeTermUUID!.trim().split(delimiter);
                if (numBedesCompositeTermUUID.length != 1 || numBedesAtomicTermUUID.length <= numBedesCompositeTermUUID.length) {
                    throw new Error('#BedesAtomicTermUUID should be greater than #BedesCompositeTermUUID');
                }
            }
        }

        // All testcases have passed; term is mapped to BedesCompositeTerm.
        // Now check if the BedesCompositeTermName is correct or not.
        // Turn the below chunk of code into its own function "validatedBedesCompositeTermName"
        if (!item.BedesAtomicTermUUID) {
            var numBedesAtomicTermUUID: Array<string> = [];
            for (let i = 0; i < compositeTermMappings.length; i += 1) {
                let termValue: Array<string> = compositeTermMappings[i].split("=");
                let bedesTerm: IBedesTerm = await bedesQuery.terms.getRecordByName(termValue[0].trim());
                let bedesTermOption: IBedesTermOption = await bedesQuery.termListOption.getRecordByName(bedesTerm._uuid!, 
                                                                                                    termValue[1].trim().replace(/['"]+/g, ""));
                numBedesAtomicTermUUID.push(bedesTermOption._uuid!);
            }
        }

        // Split BEDESAtomicTerm=BEDESAtomicTermValue into their own lists
        let bedesAtomicTerms: Array<string> = [];
        let bedesAtomicTermValues: Array<string> = [];
        for (let i = 0; i < compositeTermMappings.length; i += 1) {
            let termValue: Array<string> = compositeTermMappings[i].split("=");
            bedesAtomicTerms.push(termValue[0].trim());
            bedesAtomicTermValues.push(termValue[1].trim());
        }

        const termPromises = new Array<Promise<IBedesTerm>>();
        const termValuePromises = new Array<Promise<IBedesTermOption>>();
        // Check if all BEDES Atomic Terms and their values exist
        for (let i = 0; i < compositeTermMappings.length; i += 1) {
            termPromises.push(bedesQuery.terms.getRecordByName(bedesAtomicTerms[i]));
            if (bedesAtomicTermValues[i] != '[value]') {
                termValuePromises.push(bedesQuery.termListOption.getRecordByUUID(numBedesAtomicTermUUID![i]));
            }
        }

        const termPromisesResults = await Promise.all(termPromises)
        .catch((error: any) => {
            logger.error('BEDES Atomic Term(s) does not exist.');
            throw new Error('BEDES Atomic Term(s) does not exist.');
        });

        const termValuePromisesResults = await Promise.all(termValuePromises)
        .catch((error: any) => {
            logger.error('BEDES Atomic Term Value(s) does not exist.');
            throw new Error('BEDES Atomic Value(s) does not exist.');
        });

        // Check if BEDES Composite Term Name is correct
        let bedesTermName: string = "";
        for (let i = 0; i < bedesAtomicTermValues.length; i += 1) {
            if (bedesAtomicTermValues[i] == '[value]') {
                bedesTermName += bedesAtomicTerms[i];
            } else {
                bedesTermName += bedesAtomicTermValues[i].replace(/['"]+/g, "") + " ";
            }
        }

        if (capitalizeEachWord(bedesTermName) != item.BedesTerm) {
            logger.error('BEDES Composite Term Name is wrong.');
            throw new Error('BEDES Composite Term Name is wrong.')
        }
        return true;
    } else {
        throw new Error('The last mapping should be "x=[value]"');
    }
}
