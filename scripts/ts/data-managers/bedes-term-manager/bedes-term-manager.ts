import { BedesTerm, IBedesTerm, BedesConstrainedList } from "../../../../bedes-common/bedes-term";
import { bedesQuery } from "../../queries";
import { logger } from "../../logging";

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
        let results = await bedesQuery.terms.newRecord(term);
        logger.debug('wrote constrained list...');
        logger.debug(results);
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
