import {
    BedesTerm,
    IBedesTerm,
    BedesConstrainedList,
    IBedesTermConstrainedList
} from "../../../../bedes-common/bedes-term";
import { bedesQuery } from "../../queries";
import { logger } from "../../logging";
import { BedesTermOption } from "../../../../bedes-common/bedes-term-option/bedes-term-option";
import * as util from 'util';
import { IBedesTermOption } from "../../../../bedes-common/bedes-term-option";

export class BedesTermManager {
    constructor() {
    }

    public async writeTerm(term: BedesTerm): Promise<any> {
        if (term instanceof BedesConstrainedList) {
        }
        else {
            return await bedesQuery.terms.newRecord(term);
        }
    }

    public async writeConstrainedList(term: BedesConstrainedList): Promise<any> {
        let termData: IBedesTerm;
        try {
            termData = await bedesQuery.terms.newRecord(term);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error`);
            logger.error(util.inspect(term));
            logger.error(`${error}`);
            throw new Error('Unable to write the BedesConstrainedListTerm');
        }
        let newTerm = new BedesTerm(termData);
        if (!newTerm.id) {
            logger.debug('constrained list term not written');
            logger.debug(util.inspect(term));
            throw new Error('ConstrainedList Term not written');
        }
        for (let option of term.options) {
            let results: IBedesTermOption;
            try {
                results = await this.writeConstrainedListOption(newTerm.id, option);
                // logger.debug('successfully finished writing list option');
                // logger.debug(util.inspect(results));
            }
            catch (error) {
                logger.debug('Error writing term option');
                logger.debug(util.inspect(option));
                // TODO: throw error? or continue
                // caused by duplicate list definitions
            }
        }
        return newTerm;
    }

    public async writeConstrainedListOption(termId: number, termOption: BedesTermOption): Promise<any> {
        return bedesQuery.termListOption.newRecord(termId, termOption);
    }

    public async getRecordByName(name: string): Promise<BedesTerm | undefined> {
        try {
            let iItem = await bedesQuery.terms.getRecordByName(name);
            return new BedesTerm(iItem);
        }
        catch {
            return undefined;
        }
    }

}
