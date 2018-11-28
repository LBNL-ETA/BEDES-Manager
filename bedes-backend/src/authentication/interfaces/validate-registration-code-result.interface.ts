export interface IValidateRegistrationCodeResult {
    // unique identifier of the registration code
    id: number;
    // indicates if the registration code is still valid
    isValid: boolean;
}