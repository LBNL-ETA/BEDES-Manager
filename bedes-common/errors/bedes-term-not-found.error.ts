
export class BedesErrorTermNotFound extends Error {
    public termName: string;

    constructor(termName: string) {
        super(`BEDES term '${termName}' not found.`);
        this.termName = termName;
    }
}
