
/**
 * Determines whether the function parameter `testString` is a valid rfc4122 UUID.
 * @param testString 
 * @returns true if `testString` is a valid rfc4122 UUID, false otherwise.
 */
export function isUUID(testString: string): boolean {
    if (testString
        && typeof testString === 'string'
        && testString.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    ) {
        return true;
    }
    else {
        return false;
    }
}