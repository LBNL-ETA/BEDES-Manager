import { v4 } from 'uuid';

/**
 * Wrapper class around the node uuid functionality.
 */
export class UUIDGenerator {
    /**
     * Generates a "random" uuid.
     */
    protected generateUUID(): string {
        return v4();
    }
}
