import * as util from 'util';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { bedesQuery } from '@script-common/queries';
import { AppField } from '@bedes-common/enums';
import { AppRow } from "./app-row-hpxml";
import { IAppTerm, IAppTermAdditionalInfo } from "@bedes-common/app-term";

/**
 * App term processor: it processes a collection of AppRow objects,
 * and transforms them into AppTerm objects, which can then be linked
 * to BedesTerm objects.
 */
export class AppTermProcessor {
    private transaction: any;

    constructor() {
    }

    /**
     * Set the transaction context for the queries to be run.
     * @param transaction 
     */
    public setTransaction(transaction: any): void {
        this.transaction = transaction;
    }

    /**
     * Given a collection of AppRow objects, builds a collection of AppTerm objects,
     * which can then be stored in the database and linked to BedesTerm objects.
     * In the HPXML Workbook, the the app terms are defined 1 per sheet row, so
     * each element in appRows correponds to 1 AppTerm object.
     * @param appId 
     * @param appRows 
     * @returns transform 
     */
    public transform(appId: number, appRows: Array<AppRow>): Array<IAppTerm> {
        try {
            return appRows.map((appRow) => {
                // construct the main IAppTerm object.
                const term = <IAppTerm>{
                    _appId: appId,
                    _fieldCode: appRow.appTermCode,
                    _name: appRow.dataElement,
                    _description: appRow.definition ? appRow.definition.trim() : null,
                    _additionalInfo: new Array<IAppTermAdditionalInfo>()
                };
                // add the additional info if present.
                if (appRow.appTermCode) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.FieldCode,
                        _value: appRow.appTermCode
                    });
                }
                if (appRow.units) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.Units,
                        _value: appRow.units
                    });
                }
                if (appRow.dataType) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.DataType,
                        _value: appRow.dataType
                    });
                }
                if (appRow.enumeration) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.EnumeratedValue,
                        _value: appRow.enumeration
                    });
                }
                if (appRow.notes) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.Notes,
                        _value: appRow.notes
                    });
                }

                return term;
            });
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in buildAppTerms`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Saves a collection of IAppTerm objects to the database.
     * Returns the same set of IAppTerm objects queried from the database.
     * @param appTerms 
     * @returns app terms 
     */
    public async saveAppTerms(appTerms: Array<IAppTerm>): Promise<Array<IAppTerm>> {
        try {
            let promises = new Array<Promise<IAppTerm>>();
            appTerms.map((appTerm) => promises.push(bedesQuery.appTerm.newAppTerm(appTerm, this.transaction)));
            return Promise.all(promises);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in saveAppTerms`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appTerms));
            throw error;
        }
    }

}