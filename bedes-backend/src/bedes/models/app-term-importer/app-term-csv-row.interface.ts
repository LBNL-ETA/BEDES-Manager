import { Request } from 'express';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '../../../../../bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '../../../../../bedes-common/enums/http-status-codes';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesTerm } from '@bedes-common/models/bedes-term';
import { IBedesUnit } from '../../../../../bedes-common/models/bedes-unit/bedes-unit.template';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option';
import { ICompositeTermDetail, IBedesCompositeTerm, BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);

/**
 * TODO
 * 1. Add logger.info() statements throughout.
 */

export var delimiter: string = '\n';

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

export interface ICsvBedesAtomicTermMapping {
    MappedToBedesAtomicTerm: boolean;
    BedesTermUUID: string;
    BedesConstrainedListMapping?: Array<string>;
    BedesConstrainedListID?: Array<number | null>;
    BedesConstrainedListUUID?: Array<string | null>;
}

export interface ICsvBedesCompositeTermMapping {
    BedesCompositeTermUUID: string;
    BedesConstrainedListMapping?: Array<string>;
    BedesConstrainedListID?: Array<number | null>;
    BedesConstrainedListUUID?: Array<string | null>;
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
 * @param item csv row object
 * @returns TermType - Atomic or ConstrainedList 
 */
export function getTermTypeFromCsvName(item: IAppTermCsvRow): TermType {

    function containsEqualSignOnce(element: string) {
        return element.split("=").length == 2;
    }

    try {
        if (item.BedesConstrainedListMapping) {
            let arrBedesConstrainedListMappings: Array<string> =  item.BedesConstrainedListMapping.trim().split(delimiter);

            if (!arrBedesConstrainedListMappings.some(containsEqualSignOnce)) {
                throw new BedesError(
                    `Each Bedes constrained list mapping needs to be separated by a single '='.`,
                    HttpStatusCodes.BadRequest_400
                );
            }

            if (item.BedesConstrainedListOptionUUID) {
                let arrBedesConstrainedListOptionUUIDs: Array<string> =  item.BedesConstrainedListOptionUUID.trim().split(delimiter);
                if (arrBedesConstrainedListMappings.length != arrBedesConstrainedListOptionUUIDs.length) {
                    logger.error(`BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`);
                    throw new BedesError(
                        `BedesConstrainedListMapping & BedesConstrainedListOptionUUIDs have unequal lengths.`, 
                        HttpStatusCodes.BadRequest_400
                    );
                }
                // Add checking here to ensure that each numBedesConstrainedListMapping.split('=').length == 2
            }
            return TermType.ConstrainedList;
        } else {
            if (item.BedesConstrainedListOptionUUID) {
                logger.error(`BedesConstrainedListMapping is missing.`);
                throw new BedesError(`BedesConstrainedListMapping is missing.`, 400);
            }
            return TermType.Atomic;
        }
    } catch (error) {
        logger.error(`Error in getTermTypeFromCsvName: Term=(${item.ApplicationTerm})`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError(error.message + `Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Retrieves the unit id from the given unit name.
 *
 * @param unitName The name of the unit name to query the database.
 * @returns A Promise which resolves to the id of the found unit.
 */
export async function getUnitIdFromName(unitName: string, appTermName: string, trans?: any): Promise<number | null | undefined> {
    try {
        if (typeof unitName !== 'string' || !unitName.trim()) {
            throw new BedesError(
                'Unit name ${unitName} not found.',
                HttpStatusCodes.BadRequest_400
            )
        }
        let unit: IBedesUnit = await bedesQuery.units.getRecordByName(unitName.trim(), trans);
        return unit._id;
    } catch (error) {
        logger.error(`Error in getUnitIdFromName.`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError('Error: Not an official BEDES unit. Term = ' + appTermName, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Determines whether a term is mapped to a BEDES term or not.
 * @param item csv row object.
 * @returns true if there's no mapping.
 */
export function termhasNoMapping(item: IAppTermCsvRow): boolean {
    if (!item.BedesTerm && !item.BedesAtomicTermMapping) {
        return true;
    } else if (item.BedesTerm && item.BedesAtomicTermMapping) {
        return false;
    } else {
        logger.error(`Error in mapping: either BedesTerm and BedesAtomicTermMapping both exist or not. Term=(${item.ApplicationTerm})`);
        throw new BedesError(
            `Error in mapping: either BedesTerm and BedesAtomicTermMapping both exist or not. Term=(${item.ApplicationTerm})`, 
            HttpStatusCodes.BadRequest_400
        );
    }
}

/**
 * Returns true if the application term is mapped to a BEDES Atomic Term.
 * @param BedesAtomicTermUUID
 * @param BedesCompositeTermUUID
 * @returns true if it is mapped to a BEDES Atomic Term
 */
export async function mappedToBedesAtomicTerm(item: IAppTermCsvRow): Promise<ICsvBedesAtomicTermMapping> {
    try {
        let result: ICsvBedesAtomicTermMapping = { MappedToBedesAtomicTerm: true, BedesTermUUID: '' };
        let arrBedesAtomicTermMappings: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);
        
        if (arrBedesAtomicTermMappings.length == 1) {
            let termValue: Array<string> = arrBedesAtomicTermMappings[0].trim().split("=");
            if (termValue.length == 2 && termValue[1].trim() == '[value]') {
                // Get BEDES Atomic Term UUID
                let uuid: string = '';
                if (item.BedesAtomicTermUUID) {
                    uuid = item.BedesAtomicTermUUID;
                    if (item.BedesCompositeTermUUID) {
                        if (item.BedesAtomicTermUUID != item.BedesCompositeTermUUID) {
                            throw new BedesError(
                                `For BEDES Atomic Term, AtomicTermUUID and CompositeTermUUID must be equal. Term=(${item.ApplicationTerm})`, 
                                HttpStatusCodes.BadRequest_400
                            );
                        }
                    }
                }

                // Check that BEDES Term Name and BEDES Atomic Term UUID are correct
                let bedesTerm: IBedesTerm | undefined = undefined;
                try {
                    bedesTerm = await bedesQuery.terms.getRecordByName(item.BedesTerm!);
                } catch (error) {
                    throw new BedesError(
                        `Unrecognized BEDES Term "${item.BedesTerm}" for application term "${item.ApplicationTerm}"`,
                        HttpStatusCodes.BadRequest_400
                    );
                }

                // Check that the BEDES Term Unit is correct
                if (item.BedesTermUnit) {
                    let bedesTermUnitId: number | null | undefined = await getUnitIdFromName(item.BedesTermUnit, item.ApplicationTerm);
                    if (!bedesTermUnitId || bedesTermUnitId != bedesTerm._unitId) {
                        throw new BedesError(`Incorrect BedesTermUnit. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
                    }
                }

                if (uuid && bedesTerm._uuid != uuid) {
                    throw new BedesError(`Incorrect BedesAtomicTermUUID. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
                }
                result.BedesTermUUID = bedesTerm._uuid!;

                // Validate constrained list mappings if it exists
                if (item.BedesConstrainedListMapping) {

                    let arrBedesConstrainedListUUIDs: Array<string> = [];
                    if (item.BedesConstrainedListOptionUUID) {
                        arrBedesConstrainedListUUIDs = item.BedesConstrainedListOptionUUID.trim().split(delimiter);
                    }

                    let arrBedesConstrainedListMappings: Array<string> = item.BedesConstrainedListMapping!.trim().split(delimiter);
                    let bedesTermUUID: string = item.BedesAtomicTermUUID ? item.BedesAtomicTermUUID : bedesTerm._uuid!;
                    let arrResultBedesTermOptionID: Array<number | null> = [];
                    let arrResultBedesTermOptionUUID: Array<string | null> = [];
                    let arrResultBedesConstrainedListMapping: Array<string> = [];

                    for (let i = 0; i < arrBedesConstrainedListMappings.length; i += 1) {
                        let constListMapping: Array<string> = arrBedesConstrainedListMappings[i].trim().split("=");
                        let termOptionRecord: IBedesTermOption | undefined = undefined;
                        try {
                            termOptionRecord = await bedesQuery.termListOption.getRecordByName(bedesTermUUID, constListMapping[1].trim());
                        } catch (error) {
                            throw new BedesError(
                                `Unrecognized list option "${constListMapping[1]}" of constrained list "${item.BedesTerm}" for application term "${item.ApplicationTerm}"`,
                                HttpStatusCodes.BadRequest_400
                            );
                        }

                        if (arrBedesConstrainedListUUIDs.length > 0 && termOptionRecord._uuid != arrBedesConstrainedListUUIDs[i]) {
                            throw new BedesError(
                                `Incorrect BedesConstrainedListMappingUUID. Term=(${item.ApplicationTerm})`, 
                                HttpStatusCodes.BadRequest_400
                            );
                        }
                        arrResultBedesTermOptionID.push(termOptionRecord._id!);
                        arrResultBedesTermOptionUUID.push(termOptionRecord._uuid!);
                        arrResultBedesConstrainedListMapping.push(arrBedesConstrainedListMappings[i]);
                    }
                    result.BedesConstrainedListMapping = arrResultBedesConstrainedListMapping;
                    result.BedesConstrainedListID = arrResultBedesTermOptionID;
                    result.BedesConstrainedListUUID = arrResultBedesTermOptionUUID;
                }
            } else {
                throw new BedesError(
                    `Each Bedes atomic term mapping needs to be separated by a single '=' and RHS should be '=[value]'. Term=(${item.ApplicationTerm})`,
                    HttpStatusCodes.BadRequest_400
                );
            }
            return result;
        }
        result.MappedToBedesAtomicTerm = false;
        return result;
    } catch (error) {
        logger.error(`Error in mappedToBedesAtomicTerm: Term=(${item.ApplicationTerm})`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError(error.message + `Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Returns true if the application term is mapped to a BEDES Composite Term.
 * NOTE: item.BedesAtomicTermUUID is the UUID of the LIST OPTION (NOT the term).
 * @param item The IAppTermCsvRow object whose validity is being determined.
 */
export async function mappedToBedesCompositeTerm(item: IAppTermCsvRow, request: Request): Promise<ICsvBedesCompositeTermMapping> {
    try { 
        let result: ICsvBedesCompositeTermMapping = { BedesCompositeTermUUID: '' }
        let arrCompositeTermMappings: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);

        // Check that the last mapping is "x=[value]"
        if (arrCompositeTermMappings[arrCompositeTermMappings.length - 1].split("=")[1].trim() == '[value]') {

            let arrBedesCompositeTermUUID: Array<string> = [];
            let arrBedesAtomicTermUUIDs: Array<string> = [];

            // Check if BEDES Composite Term UUID is correct
            if (item.BedesCompositeTermUUID) {
                arrBedesCompositeTermUUID =  item.BedesCompositeTermUUID!.trim().split(delimiter);
                if (arrBedesCompositeTermUUID.length != 1) {
                    throw new BedesError(`Cannot have more than 1 BEDESCompositeTermUUID. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
                }

                try {
                    await bedesQuery.compositeTerm.getRecordByUUID(item.BedesCompositeTermUUID.trim());
                } catch (error) {
                    throw new BedesError(
                        `Unrecognized BEDES Composite Term UUID "${item.BedesCompositeTermUUID}" for application term "${item.ApplicationTerm}"`,
                        HttpStatusCodes.BadRequest_400
                    );
                }
                result.BedesCompositeTermUUID = item.BedesCompositeTermUUID.trim();
            } else {
                // Check if Composite Term exists in db - query by Composite Term name.
                var signature: string = await createCompositeTermSignature(item.BedesAtomicTermMapping!.trim().split(delimiter), item.ApplicationTerm);
                let compositeTermExists: Array<IBedesCompositeTerm> = await bedesQuery.compositeTerm.getRecordBySignature(signature);

                // Get the current user that's logged in
                const currentUser = getAuthenticatedUser(request);

                // NOTE
                // 1. In BEDES database, duplicate composite private and public terms can exist.
                // 2. However, for an individual user, there can be no duplicate composite terms. 
                // Their app term is either mapped to a private, public or BEDES approved composite term.
                if (compositeTermExists.length > 0) {
                    for (let i = 0; i < compositeTermExists.length; i += 1) {
                        // If user account contains composite term or there exists a BEDES Approved composite term
                        // then map to that term.
                        if (compositeTermExists[i]._userId == currentUser.id || compositeTermExists[i]._scopeId == 3) {
                            result.BedesCompositeTermUUID = compositeTermExists[i]._uuid!;
                        }
                    }
                }
            }

            if (item.BedesAtomicTermUUID) {
                arrBedesAtomicTermUUIDs =  item.BedesAtomicTermUUID!.trim().split(delimiter);
                if (arrBedesCompositeTermUUID) {
                    if (arrBedesAtomicTermUUIDs.length <= arrBedesCompositeTermUUID.length) {
                        throw new BedesError(
                            `#BedesAtomicTermUUID should be greater than #BedesCompositeTermUUID. Term=(${item.ApplicationTerm})`, 
                            HttpStatusCodes.BadRequest_400
                        );
                    }
                }
            }

            // Validate constrained list mappings if it exists
            if (item.BedesConstrainedListMapping) {

                // Get BedesAtomicTermUUID for constrained list mapping
                // Check that BEDES Term Name and BEDES Atomic Term UUID are correct
                let bedesTermName: string = arrCompositeTermMappings[arrCompositeTermMappings.length - 1].split('=')[0].trim();        

                let bedesTerm: IBedesTerm | undefined = undefined;
                try {
                    bedesTerm = await bedesQuery.terms.getRecordByName(bedesTermName);
                } catch (error) {
                    throw new BedesError(
                        `Unrecognized BEDES Term "${bedesTermName}" for application term "${item.ApplicationTerm}"`,
                        HttpStatusCodes.BadRequest_400
                    );
                }

                if (arrBedesAtomicTermUUIDs.length > 0 && bedesTerm._uuid != arrBedesAtomicTermUUIDs[arrBedesAtomicTermUUIDs.length - 1]) {
                    throw new BedesError(`Incorrect last BedesAtomicTermUUID. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
                }

                let arrBedesConstrainedListUUIDs: Array<string> = [];
                if (item.BedesConstrainedListOptionUUID) {
                    arrBedesConstrainedListUUIDs = item.BedesConstrainedListOptionUUID.trim().split(delimiter);
                }

                let arrBedesConstrainedListMappings: Array<string> = item.BedesConstrainedListMapping!.trim().split(delimiter);
                let bedesTermUUID: string = bedesTerm._uuid!;
                let arrResultBedesTermOptionID: Array<number | null> = [];
                let arrResultBedesTermOptionUUID: Array<string | null> = [];
                let arrResultBedesConstrainedListMapping: Array<string> = [];

                for (let i = 0; i < arrBedesConstrainedListMappings.length; i += 1) {
                    let constListMapping: Array<string> = arrBedesConstrainedListMappings[i].trim().split("=");
                    let termOptionRecord: IBedesTermOption | undefined = undefined;
                    try {
                        termOptionRecord = await bedesQuery.termListOption.getRecordByName(bedesTermUUID, constListMapping[1].trim());
                    } catch (error) {
                        throw new BedesError(
                            `Unrecognized list option "${constListMapping[1]}" of constrained list "${item.BedesTerm}" for application term "${item.ApplicationTerm}"`,
                            HttpStatusCodes.BadRequest_400
                        );
                    }

                    if (arrBedesConstrainedListUUIDs.length > 0 && termOptionRecord._uuid != arrBedesConstrainedListUUIDs[i]) {
                        throw new BedesError(
                            `Incorrect BedesConstrainedListMappingUUID. Term=(${item.ApplicationTerm})`, 
                            HttpStatusCodes.BadRequest_400
                        );
                    }
                    arrResultBedesTermOptionID.push(termOptionRecord._id!);
                    arrResultBedesTermOptionUUID.push(termOptionRecord._uuid!);
                    arrResultBedesConstrainedListMapping.push(arrBedesConstrainedListMappings[i]);
                }
                result.BedesConstrainedListMapping = arrResultBedesConstrainedListMapping;
                result.BedesConstrainedListID = arrResultBedesTermOptionID;
                result.BedesConstrainedListUUID = arrResultBedesTermOptionUUID;
            }

            await validateBedesCompositeTermName(item);
            logger.info('BEDES Composite Term Name Validated');

            return result;
        } else {
            throw new BedesError(`The last mapping should be "x=[value]". Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    } catch (error) {
        logger.error(`error in mappedToBedesCompositeTerm: Term=(${item.ApplicationTerm})`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError(error.message + `Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Validates BEDES Composite Term Name.
 * @param item csv row object
 */
export async function validateBedesCompositeTermName(item: IAppTermCsvRow) {
    try {

        let arrCompositeTermMappings: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);

        // Check that the Atomic Term Mappings are correct
        for (let i = 0; i < arrCompositeTermMappings.length; i += 1) {

            let termValue: Array<string> = arrCompositeTermMappings[i].split("=");
            let bedesTerm: IBedesTerm | undefined = undefined;
            try {
                bedesTerm = await bedesQuery.terms.getRecordByName(termValue[0].trim());
            } catch (error) {
                throw new BedesError(
                    `Unrecognized BEDES Term "${termValue[0]}" for application term "${item.ApplicationTerm}"`,
                    HttpStatusCodes.BadRequest_400
                );
            }

            let bedesTermOption: IBedesTermOption | undefined = undefined;
            if (termValue[1].trim().replace(/['"]+/g, "") != '[value]') {
                try {
                    bedesTermOption = await bedesQuery.termListOption.getRecordByName(bedesTerm._uuid!, termValue[1].trim().replace(/['"]+/g, ""));
                } catch (error) {
                    throw new BedesError(
                        `Unrecognized list option "${termValue[1]}" of constrained list "${bedesTerm._name}" for application term "${item.ApplicationTerm}"`,
                        HttpStatusCodes.BadRequest_400
                    );
                }
            }

            if (item.BedesAtomicTermUUID) {
                if (bedesTermOption) {
                    if (bedesTermOption._uuid != item.BedesAtomicTermUUID.split(delimiter)[i]) {
                        throw new BedesError(
                            `Incorrect BedesAtomicTermUUID. Term=(${item.ApplicationTerm})`, 
                            HttpStatusCodes.BadRequest_400
                        );
                    }
                } else {
                    if (bedesTerm._uuid != item.BedesAtomicTermUUID.split(delimiter)[i]) {
                        throw new BedesError(
                            `Incorrect BedesAtomicTermUUID. Term=(${item.ApplicationTerm})`, 
                            HttpStatusCodes.BadRequest_400
                        );
                    }
                }
            }
        }

        // Check if BEDES Composite Term Name is correct
        let bedesTermName: string = "";
        for (let i = 0; i < arrCompositeTermMappings.length; i += 1) {
            let termValue: Array<string> = arrCompositeTermMappings[i].split("=");
            if (termValue[1].trim().replace(/['"]+/g, "") != '[value]') {
                bedesTermName += termValue[1].trim().replace(/['"]+/g, "") + " ";
            } else {
                bedesTermName += termValue[0].trim();
            }
        }

        if (bedesTermName != item.BedesTerm && capitalizeEachWord(bedesTermName) != item.BedesTerm) {
            logger.error('BEDES Composite Term Name is wrong.');
            throw new BedesError(`BEDES Composite Term Name is wrong. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    } catch (error) {
        logger.error(`Error in validateBedesCompositeTermName: Term=(${item.ApplicationTerm})`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError(error.message + `Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Creates new composite term
 * @param item csv row object
 * @param result contains CompositeTerm objects through prior queries to db
 */
export async function createNewCompositeTerm(item: IAppTermCsvRow, result: ICsvBedesCompositeTermMapping, 
                                            request: Request): Promise<ICsvBedesCompositeTermMapping> {
    try {
        var signature: string = '';
        var bedesCompositeTermUnitId: number;
        var items: Array<ICompositeTermDetail> = [];
        var bedesTermOption: IBedesTermOption | null = null;
        var arrAtomicTerms: Array<string> = item.BedesAtomicTermMapping!.trim().split(delimiter);

        for (let i = 0; i < arrAtomicTerms.length; i += 1) {
            let arr: Array<string> = arrAtomicTerms[i].split("=");
            let bedesTerm: IBedesTerm = await bedesQuery.terms.getRecordByName(arr[0].trim());
            if (arr[1].trim().replace(/['"]+/g, "") != '[value]') {
                bedesTermOption = await bedesQuery.termListOption.getRecordByName(bedesTerm._uuid!, arr[1].trim().replace(/['"]+/g, ""));
                signature += bedesTerm._id! + ':' + bedesTermOption._id!;
                signature += '-';
            } else {
                bedesTermOption = null;
                signature += bedesTerm._id!;

                var unitName: string = (await bedesQuery.units.getRecordById(bedesTerm._unitId!))._name;

                // Unit in import file shouldn't be overwritten with blank BEDES unit
                if (unitName == 'n/a') {
                    bedesCompositeTermUnitId = (await bedesQuery.units.getRecordByName(item.BedesTermUnit!))._id!;
                } else {
                    bedesCompositeTermUnitId = bedesTerm._unitId!;
                }
            }

            let compositeTermDetailParams: ICompositeTermDetail = {
                _term: bedesTerm,
                _listOption: bedesTermOption,
                _orderNumber: i + 1 // _orderNumber is 1-indexed
            }
            items.push(compositeTermDetailParams);
        }
        if (signature[signature.length - 1] == '-') { // "signature += '-'" appends a hypen at the end which needs to be removed
            signature = signature.slice(0, -1);
        }

        // Get Data Type ID
        var dataTypeId: number | null = null;
        if (item.BedesTermDataType) {
            dataTypeId = (await bedesQuery.dataType.getRecordByName(item.BedesTermDataType!))._id!;
        }

        var compositeTermParams: IBedesCompositeTerm = {
            _signature: signature,
            _name: item.BedesTerm,
            _description: item.BedesTermDescription,
            _unitId: bedesCompositeTermUnitId!,
            _dataTypeId: dataTypeId,
            _items: items,
            _scopeId: 1,
            _ownerName: 'null'                         // TODO: PG: Change this.
        }

        let compositeTerm = new BedesCompositeTerm(compositeTermParams);
        compositeTermParams._uuid = compositeTerm.uuid;
        result.BedesCompositeTermUUID = compositeTerm.uuid!;

        // get the current user that's logged in
        const currentUser = getAuthenticatedUser(request);

        // save the term
        var savedTerm = await bedesQuery.compositeTerm.newCompositeTerm(currentUser, compositeTermParams);

        if (!savedTerm || !savedTerm._id) {
            throw new BedesError(`Error creating new composite term. Term=(${item.ApplicationTerm})`, 400);
        }
        return result;
    } catch (error) {
        logger.error(`error in createNewCompositeTerm: Term=(${item.ApplicationTerm})`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new BedesError(error.message + `. Term=(${item.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
        }
    }
}

/**
 * Creates signature of composite term
 * @param str array of BEDES Atomic Terms that make up the Composite Term.
 * @returns str signature
 */
export async function createCompositeTermSignature(arrAtomicTerms: Array<String>, applicationTermName: string) {
    try {
        var signature: string = '';
        var items: Array<ICompositeTermDetail> = [];
        var bedesTermOption: IBedesTermOption | null = null;

        for (let i = 0; i < arrAtomicTerms.length; i += 1) {

            let arr: Array<string> = arrAtomicTerms[i].split("=");

            let bedesTerm: IBedesTerm | undefined = undefined;
            try {
                bedesTerm = await bedesQuery.terms.getRecordByName(arr[0].trim());
            } catch (error) {
                throw new BedesError(
                    `Unrecognized BEDES Term "${arr[0]}" for application term "${applicationTermName}"`,
                    HttpStatusCodes.BadRequest_400
                );
            }

            if (arr[1].trim().replace(/['"]+/g, "") != '[value]') {
                let bedesTermOption: IBedesTermOption | undefined = undefined;
                try {
                    bedesTermOption = await bedesQuery.termListOption.getRecordByName(bedesTerm._uuid!, arr[1].trim().replace(/['"]+/g, ""));
                } catch (error) {
                    throw new BedesError(
                        `Unrecognized list option "${arr[1]}" of constrained list "${bedesTerm._name}" for application term "${applicationTermName}"`,
                        HttpStatusCodes.BadRequest_400
                    );
                }

                signature += bedesTerm._id! + ':' + bedesTermOption._id!;
                signature += '-';
            } else {
                bedesTermOption = null;
                signature += bedesTerm._id!;
            }

            let compositeTermDetailParams: ICompositeTermDetail = {
                _term: bedesTerm,
                _listOption: bedesTermOption,
                _orderNumber: i + 1 // _orderNumber is 1-indexed
            }
            items.push(compositeTermDetailParams);
        }

        // Remove "-" appended at the end due to the "signature += '-'" statement above.
        if (signature[signature.length - 1] == '-') {
            signature = signature.slice(0, -1);
        }

        return signature;
    } catch (error) {
        logger.error(`error in createCompositeTermSignature`);
        if (error instanceof BedesError) {
            throw error;
        } else {
            throw new Error('error in creating composite term signature. ');
        }
    }
}

/**
 * Capitalizes each word of sentence.
 * e.g. 'hi, my name is slim shady' -> 'Hi, My Name Is Slim Shady'
 * @param str input string
 */
export function capitalizeEachWord(str: string) {
    let temp = str.split(" ");
    for (let j = 0; j < temp.length; j += 1) {
        temp[j] = temp[j][0].toUpperCase() + temp[j].substr(1);
    }
    return temp.join(" ");
}
