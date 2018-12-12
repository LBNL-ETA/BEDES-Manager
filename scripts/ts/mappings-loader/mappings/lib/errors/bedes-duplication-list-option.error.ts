
export class BedesErrorDuplicateListOption extends Error {
    public termName: string;
    public termOption: string;

    constructor(termName: string, termOption: string) {
        super(`BEDES term option '${termName} - ${termOption}' not found.`);
        this.termName = termName;
        this.termOption = termOption;
    }
}
