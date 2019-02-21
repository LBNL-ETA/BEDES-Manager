/**
 * Defines the data object returned from query for retrieving a
 * verification code record, in determinining if a given verification code
 * is valid or not.
 */
export interface IGetVerificationCodeResult {
    // the id of the record in the auth.verification_code table
    readonly _id: number;
    // indicates if the returned registration code record is valid
    readonly _isValid: boolean;
}