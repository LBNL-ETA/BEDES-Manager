
export class BedesMappingLabel {
    constructor(
        public termName: string,
        public value: string
    ) { }

    /**
     * Determines if the mapping label is a value indicator
     * ie this.value = "[value]"
     */
    public isValueField(): boolean {
        return this.value && this.value.trim() === '[value]' ? true : false;
    }
}
