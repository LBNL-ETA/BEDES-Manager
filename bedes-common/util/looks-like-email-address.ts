/** regular expression for a valid email address */
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Determines if an email address looks valid.
 */
export function looksLikeEmailAddress(emailAddress: any): boolean {
    return typeof emailAddress === 'string' && emailAddress.match(emailRegEx)
        ? true : false;
}
