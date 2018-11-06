export class BedesError extends Error {
    public responseStatusCode: number;
    public responseMessage: string;

    constructor(errorMessage: string, responseStatusCode: number, responseMessage: string) {
        super(errorMessage);
        this.responseStatusCode = responseStatusCode;
        this.responseMessage = responseMessage;
    }

}