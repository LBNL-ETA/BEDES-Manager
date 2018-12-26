import { BedesTermSectorLink } from '../bedes-term-sector-link/bedes-term-sector-link';
import { BedesSectorValues } from '../../enums/bedes-sector.enum';
import { IBedesTermSectorLink } from '../bedes-term-sector-link/bedes-term-sector-link.interface';

/**
 * Manages the term sector assignments for a BedesTerm.
 */
export class BedesSectorList {
    private _items: Array<BedesTermSectorLink>;

    constructor(data?: Array<IBedesTermSectorLink>) {
        this._items = new Array<BedesTermSectorLink>();
        if (data) {
            // build the list of sectorLink objects
            this._items = data.map((d) => new BedesTermSectorLink(d));
        }
    }

    /**
     * Determines if the term has been assigned to a specified sector.
     */
    public hasSector(sector: BedesSectorValues): boolean {
        return this._items.find((d) => d.sectorId === sector)
            ? true
            : false
        ;
    }

    /**
     * Determines if the sector has been assigned to Commercial
     */
    public hasCommercial(): boolean {
        return this.hasSector(BedesSectorValues.Commercial);
    }

    /**
     * Determines if the sector has been assigned to Residential
     */
    public hasResidential(): boolean {
        return this.hasSector(BedesSectorValues.Residential);
    }

    /**
     * Determines if the sector has been assigned to Multifamily 
     */
    public hasMultifamily(): boolean {
        return this.hasSector(BedesSectorValues.Multifamily);
    }

    /**
     * Assigns a specified sector to the term.
     */
    public addSector(sector: BedesSectorValues): void {
        // throw an error if the sector is already there
        if (this.hasSector(sector)) {
            throw new Error(`Sector ${sector} is already assigned.`);
        }
        // add the sector
        this._items.push(new BedesTermSectorLink({_sectorId: sector}));
    }

    /**
     * Set's the assignment of a sector to a term.
     */
    public setSector(sector: BedesSectorValues, isAssignedToTerm: boolean): void {
        if (isAssignedToTerm && !this.hasSector(sector)) {
            this.addSector(sector);
        }
        else if (!isAssignedToTerm && this.hasSector(sector)) {
            this.removeSector(sector)
        }
    }

    /**
     * Remove a sector classification from the term.
     */
    public removeSector(sector: BedesSectorValues): void {
        const index = this._items.findIndex((d) => d.sectorId === sector);
         if (index >= 0) {
             this._items.splice(index, 1);
         }
         else {
             throw new Error(`Sector ${sector} not found`);
         }
    }

    /**
     * Clear the list of sectors assigned to this term.
     */
    public clearSectorList(): void {
        this._items.splice(0, this._items.length);
    }

    /**
     * Replaces the current list of sector assignments with the one passed in.
     */
    public assignSectors(sectors: Array<BedesTermSectorLink>): void {
        //  clear the list
        this.clearSectorList();
        // create a shallow copy of the array
        this._items = [...sectors];
    }

    /**
     * Returns the list of BedestermSectorLink objects as inteface objects.
     */
    public toInterface(): Array<IBedesTermSectorLink> {
        return this._items.map((d) => d.toInterface());
    }
}