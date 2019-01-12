/**
 * Defines the enumerated values for the different states
 * that an application can be in as it's in the queue for applications 
 * to be made public.
 */
export enum ApplicationRequestStatus {
    Pending=1,
    Approved=2,
    Rejected=3
}