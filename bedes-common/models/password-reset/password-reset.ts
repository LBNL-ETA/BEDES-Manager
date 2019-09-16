/**
 * json payload signature for requesting password resets
 */
export interface IPasswordResetRequest {
    /** the email account to reset */
    accountEmail: string;
}

/** json payload signature for responses to password reset requests  */
export interface IPasswordResetResponse {
    /** indicator if the request was successfull */
    success: boolean;
}
