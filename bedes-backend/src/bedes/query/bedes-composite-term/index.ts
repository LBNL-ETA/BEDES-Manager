import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesCompositeTerm, ICompositeTermDetail, BedesCompositeTerm, CompositeTermDetail } from '@bedes-common/models/bedes-composite-term';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short';
import { ICompositeTermDetailRequestParam } from '@bedes-common/models/composite-term-detail-request-param';
import { ICompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { CurrentUser } from '@bedes-common/models/current-user';
import { buildCompositeTermSignature, getSignatureItem, buildSignatureFromCompositeTermDetail } from '@bedes-common/util/build-composite-term-signature';
import { compositeTerm } from '@bedes-backend/bedes/handlers';

export class BedesCompositeTermQuery {
    private sqlGetBySignature: QueryFile;
    private sqlGetById: QueryFile;
    private sqlGetByUUID: QueryFile;
    private sqlGetAllTerms: QueryFile;
    private sqlGetAllTermsAuth: QueryFile;
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlGetCompositeTermComplete: QueryFile;
    private sqlGetCompositeTermCompleteUUID: QueryFile;
    private sqlDelete: QueryFile;
    private sqlAppPrivateToPublic: QueryFile;

    constructor() { 
        this.sqlGetBySignature = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlGetById = sql_loader(path.join(__dirname, 'get-by-id.sql'));
        this.sqlGetByUUID = sql_loader(path.join(__dirname, 'get-by-uuid.sql'));
        this.sqlGetAllTerms = sql_loader(path.join(__dirname, 'get-all-terms.sql'));
        this.sqlGetAllTermsAuth = sql_loader(path.join(__dirname, 'get-all-terms-auth.sql'));
        this.sqlGetCompositeTermComplete = sql_loader(path.join(__dirname, 'get-composite-term-complete.sql'));
        this.sqlGetCompositeTermCompleteUUID = sql_loader(path.join(__dirname, 'get-composite-term-complete-uuid.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
        this.sqlAppPrivateToPublic = sql_loader(path.join(__dirname, 'app-private-to-public.sql'))
    }

    /**
     * Writes a IBedesCompositeTerm object to the db, saving both the
     * master and detail records.
     */
    public async newCompositeTerm(
        currentUser: CurrentUser,
        item: IBedesCompositeTerm,
        transaction?: any
    ): Promise<IBedesCompositeTerm> {
        try {
            if (!currentUser) {
                throw new BedesError(
                    'Unauthorized.',
                    HttpStatusCodes.Unauthorized_401
                );
            }
            // create the composite term record
            let newRec: IBedesCompositeTerm | undefined;
            try {
                newRec = await this.newRecord(currentUser, item, transaction);
            }
            catch (error) {
                if (error && error.code === "23505") {
                    throw new BedesError(
                        'Composite term already exists.',
                        HttpStatusCodes.BadRequest_400,
                        'Composite term already exists.'
                    )
                }
                throw error;
            }
            if (!newRec || !newRec._id) {
                throw new Error(`${this.constructor.name}: missing _id returned from newCompositeTerm query`);
            }
            const detailItems = new Array<ICompositeTermDetail>();
            newRec._items = detailItems;
            const promises = new Array<Promise<ICompositeTermDetail>>();
            // save all of the detail items.
            for (let detailItem of item._items) {
                promises.push(bedesQuery.compositeTermDetail.newRecord(newRec._id, detailItem, transaction)
                    .then((newDetailRec: ICompositeTermDetail) => {
                        detailItems.push(newDetailRec);
                        return newDetailRec;
                    }));
            }
            await Promise.all(promises);
            return newRec;

        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newCompositeTerm`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Writes an IBedesCompositeTerm record to the database.
     */
    public async newRecord(
        currentUser: CurrentUser,
        item: IBedesCompositeTerm,
        transaction?: any
    ): Promise<IBedesCompositeTerm> {
        try {
            if (!currentUser) {
                throw new BedesError(
                    'Unauthorized.',
                    HttpStatusCodes.Unauthorized_401
                );
            }
            if (!item._signature) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-newRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _signature: item._signature,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId,
                _uuid: item._uuid,
                _userId: currentUser.id,
                _scopeId: item._scopeId
            };
            // first create the composite term record
            const ctx = transaction || db;
            return await ctx.one(this.sqlInsert, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Update an existing composite term.
     *
     * @param currentUser The authenticated user the term is linked to.
     * @param item The object record to update.
     * @returns The record that was just updated.
     */
    public async updateCompositeTerm(
        currentUser: CurrentUser,
        item: IBedesCompositeTerm,
        transaction?: any
    ): Promise<IBedesCompositeTerm> {
        try {
            // make sure a user is linked to the term
            if (!currentUser) {
                throw new BedesError(
                    'Unauthorized.',
                    HttpStatusCodes.Unauthorized_401
                );
            }
            // make sure there's a valid id on the object.
            if (!item._id) {
                throw new BedesError(
                    'valid id expected for updating a composite term.',
                    HttpStatusCodes.ServerError_500
                );
            }
            // make sure this runs in a transaction if it isn't
            if (!transaction) {
                // create the transaction and call again
                return db.tx((newTransaction: any) => {
                    return this.updateCompositeTerm(currentUser, item, newTransaction);
                });
            }
            // make sure the term is allowed to be udpated
            const isEditable = await this.canUpdateCompositeTerm(currentUser, item, transaction);
            if (!isEditable) {
                throw new BedesError(
                    'Term not editable.',
                    HttpStatusCodes.BadRequest_400
                );
            }
            // delete the existing detail items
            await bedesQuery.compositeTermDetail.deleteByCompositeTermId(item._id, transaction);
            const promises = new Array<Promise<ICompositeTermDetail>>();
            // save all of the detail items.
            for (let detailItem of item._items) {
                promises.push(
                    bedesQuery.compositeTermDetail.newRecord(item._id, detailItem, transaction)
                    .then((newRec: ICompositeTermDetail) => {
                        // assign the new id to the existing detail item
                        detailItem._id = newRec._id;
                        return newRec;
                    })
                );
            }
            // resolve all the promises before continueing
            const newDetailData : Array<ICompositeTermDetail> = await Promise.all(promises);
            const compositeTerm = new BedesCompositeTerm(item);
            // // sort the terms as they appear in the definition
            // newDetailItems.sort(BedesCompositeTerm.detailItemSorter);
            // build a new signature for the term
            // const newSignature = buildSignatureFromCompositeTermDetail(item._items);
            // update the signature of the record to update to reflect the new detail item ids
            // item._signature = newSignature;
            // update the composite term record
            let newRec: IBedesCompositeTerm | undefined;
            try {
                newRec = await this.updateRecord(currentUser, compositeTerm.toInterface(), transaction);
            }
            catch (error) {
                logger.error('error in updatecompositeTerm');
                console.log(error);
            }
            if (!newRec) {
                throw new Error(`${this.constructor.name}: updateRecord should have returned an object, none received`);
            }
            if (!newRec._id) {
                throw new Error(`${this.constructor.name}: missing _id returned from newCompositeTerm query`);
            }
            await Promise.all(promises);
            return newRec;

        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateCompositeTerm`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Determines if a composite term can be updated
     * @param currentUser The user requesting the operation
     * @param newTerm The new composite term to be updated
     * @param [transaction] db transaction context for queries
     */
    private async canUpdateCompositeTerm(
        currentUser: CurrentUser,
        newTermData: IBedesCompositeTerm,
        transaction?: any
    ): Promise<boolean> {
        // make sure there's a valid id on the object.
        if (!newTermData._id) {
            throw new BedesError(
                'valid id expected for updating a composite term.',
                HttpStatusCodes.ServerError_500
            );
        }
        // create a BedesComposoiteTerm from the new term data
        const newTerm = new BedesCompositeTerm(newTermData);

        // test conditions that don't rely on extracting the existing term first
        // make sure the new term does not have approved scope
        if (currentUser.isAdmin()) {
            // admins can edit non-approved terms
            return true;
        }

        // now test conditions that require looking at the existing term
        // get the existing composite term data
        const existData = await this.getRecordById(newTermData._id, transaction);
        // build the composite term object
        const existObj = new BedesCompositeTerm(existData);
        // look at the user ids of the terms
        if (existObj.hasApprovedScope()) {
            // not allowed to update composite terms that has approved scope.
            return false;
        }
        else if (existObj.userId !== currentUser.id) {
            // the owner is the only non-admin that can update a term
            return false;
        }
        // ok to update
        return true;
    }

    /**
     * Updates an existing BedesCompositeTermRecord.
     */
    public async updateRecord(
        currentUser: CurrentUser,
        item: IBedesCompositeTerm,
        transaction?: any
    ): Promise<IBedesCompositeTerm> {
        try {
            if (!currentUser) {
                throw new BedesError(
                    'Unauthorized.',
                    HttpStatusCodes.Unauthorized_401
                );
            }
            if (!item._signature) {
                logger.error(`${this.constructor.name}: Missing a composite term signature in BedesUnit-updateRecord`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400);
            }
            const params = {
                _id: item._id,
                _signature: item._signature,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId,
                _userId: currentUser.id,
                _scopeId: item._scopeId
            };
            // first create the composite term record
            const ctx = transaction || db;
            return await ctx.one(this.sqlUpdate, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateRecord`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Build ICompositeTermDetail objects from the given uuids listed in the queryParams object.
     */
    public async getCompositeTermDetailInfo(
        queryParams: Array<ICompositeTermDetailRequestParam>,
        transaction?: any
    ): Promise<Array<ICompositeTermDetailRequestResult>> {
        try {
            if (!queryParams || !Array.isArray(queryParams)) {
                logger.error(`${this.constructor.name}: buildTermDetails expends an array of queryParams, none found.`);
                throw new Error('Missing required parameters.');
            }
            const results = new Array<ICompositeTermDetailRequestResult>();
            for (let queryParam of queryParams) {
                // fetch a bedes term and list option record, if it
                const newRec: ICompositeTermDetailRequestResult = {
                    term: await bedesQuery.terms.getRecordByUUID(queryParam.termUUID, transaction),
                    listOption: queryParam.listOptionUUID
                        ? await bedesQuery.termListOption.getRecordByUUID(queryParam.listOptionUUID, transaction)
                        : undefined
                };
                results.push(newRec);
            }
            return results;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in buildCompositeTermDetails`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(queryParams));
            throw error;
        }
    }

    /**
     * Searches the database for a matching composite term signature.
     */
    public getRecordBySignature(signature: string, transaction?: any): Promise<Array<IBedesCompositeTerm>> {
        try {
            if (!signature) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _signature: signature
            };
            if (transaction) {
                // return transaction.oneOrNone(this.sqlGetBySignature, params);

                // PG: Signature is no longer a unique constraint
                return transaction.manyOrNone(this.sqlGetBySignature, params);
            }
            else {
                // return db.oneOrNone(this.sqlGetBySignature, params);

                // PG: Signature is no longer a unique constraint
                return db.manyOrNone(this.sqlGetBySignature, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordBySignature`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Searches the database for a matching composite term id.
     */
    public getRecordById(id: number, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.oneOrNone(this.sqlGetById, params);
            }
            else {
                return db.oneOrNone(this.sqlGetById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves an IBedesCompositeTerm record from the database given a uuid.
     *
     * @param uuid The uuid of the composite term record to retrieve.
     * @param [transaction] Optional database transaction context.
     * @returns Promise that resolves to the IBedesCompositeTerm record.
     */
    public getRecordByUUID(uuid: string, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: getRecordByUUID expecs a uuid`);
                throw new BedesError(
                    'Invalid parameters',
                    HttpStatusCodes.BadRequest_400,
                    'Invalid parameters'
                );
            }
            const params = {
                _uuid: uuid
            };
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetByUUID, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordByUUID`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retireves the list of all public composite terms in the database,
     * in addition to the terms belonging to the given user.
     * @param [currentUser] The an optional authenticated user (users private terms are returned in addition to public terms).
     * @param [transaction] An optional database transaction context.
     * @returns Returns an array of composite terms.
     */
    public getAllTerms(currentUser?: CurrentUser, transaction?: any): Promise<Array<IBedesCompositeTermShort>> {
        try {
            const ctx = transaction || db;
            if (currentUser) {
                // if a users was passed in, get the private terms for that user
                const params = {
                    _userId: currentUser.id
                }
                return ctx.manyOrNone(this.sqlGetAllTermsAuth, params);
            }
            else {
                // otherwise only get public terms
                return ctx.manyOrNone(this.sqlGetAllTerms);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllTerms`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Retrieves a complete IBedesCpompositeTerm object for the given
     * composite term_id.
     */
    public getRecordComplete(id: number, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetCompositeTermComplete, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordComplete`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves a complete IBedesCpompositeTerm object for the given uuid.
     */
    public getRecordCompleteByUUID(uuid: string, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid
            };
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetCompositeTermCompleteUUID, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordComplete`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Deletes a BedesCompositeTerm record by its uuid.
     * 
     * @param currentUser The authenticated user the term is linked to
     * @param uuid The UUID of the BedesTerm to delete.
     * @param [transaction] The optional database transaction context.
     * @returns A Promise that resolves to the number of rows deleted.
     */
    public async deleteRecord(currentUser: CurrentUser, uuid: string, transaction?: any): Promise<number> {
        try {
            if (!currentUser) {
                throw new BedesError(
                    'Unauthorized.',
                    HttpStatusCodes.Unauthorized_401
                );
            }
            if (!uuid) {
                logger.error(`${this.constructor.name}: deleteRecord expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid,
                _userId: currentUser.id
            };
            const ctx = transaction || db;
            return ctx.result(this.sqlDelete, params, (r: any) => r.rowCount);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Set all composite terms for a given application id to public.
     * @param currentUser 
     * @param appId 
     * @param [transaction] 
     * @returns application composite terms to public 
     */
    public async setApplicationCompositeTermsToPublic(
        currentUser: CurrentUser,
        appId: number,
        transaction?: any
    ): Promise<void> {
        try {
            if (!appId) {
                logger.error(`${this.constructor.name}: missing appId in setApplicationComppositeTermsToPublic`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400);
            }
            // build the query params
            const params = {
                _applicationId: appId
            };
            // select the query context and run it
            const ctx = transaction || db;
            return await ctx.none(this.sqlAppPrivateToPublic, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in setApplicationCompositeTermsToPublic`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
