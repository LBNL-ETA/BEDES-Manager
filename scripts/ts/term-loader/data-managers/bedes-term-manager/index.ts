import {
    BedesTerm,
    IBedesTerm,
    BedesConstrainedList,
    IBedesConstrainedList
} from "@bedes-common/bedes-term";
import { bedesQuery } from "@script-common/queries";
import { createLogger } from '@script-common/logging';
const logger = createLogger(module);
import { BedesTermOption } from "@bedes-common/bedes-term-option/bedes-term-option";
import * as util from 'util';
import { IBedesTermOption } from "@bedes-common/bedes-term-option";

export class BedesTermManager {

    public async writeTerm(term: BedesTerm): Promise<BedesTerm> {
        let data = await bedesQuery.terms.newRecord(term.toInterface());
        return new BedesTerm(data);
    }

    public async writeConstrainedList(term: BedesConstrainedList): Promise<BedesConstrainedList> {
        try {
            let data = await bedesQuery.terms.newConstrainedList(term.toInterface());
            return new BedesConstrainedList(data);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error writing constrained list`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(term));
            throw error;
        }
    }

    // public async writeConstrainedListOption(termId: number, termOption: BedesTermOption): Promise<any> {
    //     return bedesQuery.termListOption.newRecord(termId, termOption);
    // }

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

