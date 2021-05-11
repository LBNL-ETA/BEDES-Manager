import * as fs from 'fs';
import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import * as path from 'path';
import * as util from 'util';
import { BedesUnitManager } from "../term-loader/data-managers/unit-manager";
import { BedesUnit, IBedesUnit } from "@bedes-common/models/bedes-unit";
import { BedesTerm, BedesConstrainedList, IBedesConstrainedList, IBedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermOption } from "@bedes-common/models/bedes-term-option/bedes-term-option";
import { IBedesTermOption } from "@bedes-common/models/bedes-term-option/bedes-term-option.interface";
import { BedesDataTypeManager } from "../term-loader/data-managers/data-type-manager";
import { BedesDataType, IBedesDataType } from "@bedes-common/models/bedes-data-type";
import { BedesTermManager } from "../term-loader/data-managers/bedes-term-manager";
import { BedesDefinitionSourceManager } from "../term-loader/data-managers/definition-source-manager";
import { BedesTermCategoryManager } from "../term-loader/data-managers/term-category-manager";
import { BedesTermCategory, IBedesTermCategory } from "@bedes-common/models/bedes-term-category";
import { BedesDefinitionSource } from "@bedes-common/models/bedes-definition-source";
import * as xml2js from 'xml2js';
import { IXmlNodes } from './xml-nodes/xml-nodes.interface';
import { validXmlNode } from './xml-nodes/valid-xml-node';
import { xmlNodeToTerm } from './xml-node-to-term';
import { IXmlTerm } from '../../../bedes-common/models/xml-term/xml-term.interface';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesSector } from '@bedes-common/models/bedes-sector/bedes-sector.interface';
import { BedesSector } from '../../../bedes-common/models/bedes-sector/bedes-sector';
import { IBedesTermSectorLink } from '../../../bedes-common/models/bedes-term-sector-link/bedes-term-sector-link.interface';

/**
 * Load's the BEDES terms from BEDES_all-terms_V2-2.xml
 */
export class XmlTermLoader {
    private filePath: string;
    private fileName: string;
    private dataTypes: Array<IBedesDataType>;
    private units: Array<IBedesUnit>;
    private categories: Array<IBedesTermCategory>;
    private sectors: Array<IBedesSector>;

    constructor(filePath: string, fileName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.dataTypes = new Array<IBedesDataType>();
        this.units = new Array<IBedesUnit>();
        this.categories = new Array<IBedesTermCategory>();
        this.sectors = new Array<IBedesSector>();
    }

    /**
     * Runs term loader.
     */
    public async run(): Promise<any>{
        try {
            const xml: IXmlNodes = await this.openFile();
            await this.loadLookupTables();
            logger.debug('received xml');
            return this.loadXml(xml);
            logger.debug('exit run()');
        }
        catch (error) {
            logger.error(`${this.constructor.name}: unable to load the xml term file.`);
        }
    }

    /**
     * Load's the lookup tables from the database.
     */
    public async loadLookupTables(): Promise<any> {
        try {
            const promises = new Array<Promise<Array<any>>>();
            promises.push(bedesQuery.dataType.getAllRecords());
            promises.push(bedesQuery.units.getAllRecords());
            promises.push(bedesQuery.termCategory.getAllRecords());
            promises.push(bedesQuery.sector.getAllRecords());
            // wait for all promises to resolve
            [this.dataTypes, this.units, this.categories, this.sectors] = await Promise.all(promises);
            console.log(this.sectors);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error loading lookup tables`);
            console.log(error);
            throw error;
        }
    }

    /**
     * Open the xml file.
     */
    public async openFile(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(path.join(this.filePath, this.fileName), (err: NodeJS.ErrnoException | null, data: Buffer) => {
                    const parser = new xml2js.Parser();
                    parser.parseString(data, (err: any, result: any) => {
                        logger.info(`done parsing xml`);
                        if (err) {
                            logger.error(`${this.constructor.name}: Error in openFile -> parseString`);
                            logger.error(util.inspect(err));
                            reject(err);
                            return;
                        }
                        resolve(result);
                    });
                });
            }
            catch (error) {
                logger.error(`${this.constructor.name}: error opening file "${this.fileName}" in folder "${this.filePath}"`);
                reject(error);
            }
        });
    }

    /**
     * Load the xml object returned from xml2js.parseString.
     */
    private async loadXml(xml: IXmlNodes): Promise<any> {
        try {
            console.log('loadXml...');
            for (let node of xml.nodes.node) {
                // logger.debug(util.inspect(node));
                if (!validXmlNode(node)) {
                    throw new Error(`Invalid xml Node`);
                }
                const xmlTerm = xmlNodeToTerm(node);
                await this.processTerm(xmlTerm);
                // logger.debug('created term');
                // logger.debug(util.inspect(xmlTerm));
                // break
            }
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in loadXml`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async processTerm(xmlTerm: IXmlTerm): Promise<any> {
        let dataChanged = false;
        if (!xmlTerm.name) {
            throw new Error('xmlTerm requires a valid name');
        }
        let bedesTerm = await bedesQuery.terms.getRecordByName(xmlTerm.name);
        if (!bedesTerm) {
            logger.error(`${this.constructor.name}: BedesTerm not found for xmlTerm:`);
            logger.error(bedesTerm);
            console.log(xmlTerm);
            throw new Error('bedesTerm not found');
        }
        // term category id
        const termCategory = this.categories.find((d) => d._name === xmlTerm.categoryName);
        if (!termCategory) {
            logger.error(`couldn't find matching term category for xml term`);
            logger.error(util.inspect(xmlTerm));
            logger.error(util.inspect(bedesTerm));
            console.log(this.categories);
            throw new Error(`Invalid TermCategoryId (${bedesTerm._termCategoryId})`)
        }
        else if (termCategory._id !== bedesTerm._termCategoryId) {
            logger.error('termCategoryId does not match');
            logger.error(util.inspect(termCategory));
            logger.error(util.inspect(bedesTerm));
            throw new Error(`XML <-> BedesTerm category do not match`);
        }
        // data type
        const dataType = this.dataTypes.find((d) => d._name === xmlTerm.dataTypeName);
        if (!dataType) {
            logger.warn(`couldn't find matching dataType for xml term`);
            logger.warn(util.inspect(xmlTerm));
            logger.warn(util.inspect(bedesTerm));
            // console.log(this.dataTypes);
            // throw new Error(`Invalid data type (${xmlTerm.dataTypeName})`)
        }
        else if (dataType._id !== bedesTerm._dataTypeId) {
            logger.error('dataTypeId does not match');
            logger.error(util.inspect(termCategory));
            logger.error(util.inspect(bedesTerm));
            throw new Error(`XML <-> BedesTerm dataType do not match`);
        }
        // update uuid and url
        if (!bedesTerm._uuid && xmlTerm.uuid) {
            bedesTerm._uuid = xmlTerm.uuid;
            dataChanged = true;
        }
        if (!bedesTerm._url && xmlTerm.url) {
            bedesTerm._url = xmlTerm.url;
            dataChanged = true;
        }
        // sector - write the sector info for the term
        if (xmlTerm.sectorNames) {
            bedesTerm._sectors = this.buildSectorsFromArray(xmlTerm.sectorNames);
            dataChanged = true;
        }

        if (dataChanged) {
            return bedesQuery.terms.updateTerm(bedesTerm);
        }

    }

    /**
     * Determines if a given sector name is a valid one.
     */
    private isValidSector(sectorName: string): boolean {
        if (sectorName.toLowerCase() !== 'n/a') {
            return true;
        }
        else {
            return false;
        }

    }

    /**
     * Takes an array of BedesSector names,
     * and returns them as an array of IBedesTermSectorLink objects.
     * eg [Commercial, Residential] -> [{_sectorId: 1}, {_sectorId: 2}]
     */
    private buildSectorsFromArray(sectorNames: Array<string>): Array<IBedesTermSectorLink> {
        try {
            // // stores the valid sectorNames to return
            // const sectorNames = new Array<string>();
            // // parse the name string and push valid names to sectorNames.
            // sectorNamesString
            //     .split(',')
            //     .map((d) => d.trim())
            //     .forEach((sectorName: string) => {
            //         if (this.isValidSector(sectorName)) {
            //             sectorNames.push(sectorName);
            //         }
            //     });
            // create the return arry
            const sectors = new Array<IBedesTermSectorLink>();
            sectorNames.forEach((sectorName: string) => {
                if (sectorName && sectorName.toLowerCase() !== 'n/a') {
                    const found = this.sectors.find((d) => d._name.toLowerCase() === sectorName.trim().toLowerCase())
                    if (!found) {
                        throw new Error(`sector name ${sectorName} not found`);
                    }
                    sectors.push(<IBedesTermSectorLink>{_sectorId: found._id});
                }
            });
            return sectors;
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in buildSectors`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(sectorNames));
            throw error;
        }
    }

    private buildSectors(sectorNamesString: string): Array<IBedesTermSectorLink> {
        try {
            // // stores the valid sectorNames to return
            // const sectorNames = new Array<string>();
            // // parse the name string and push valid names to sectorNames.
            // sectorNamesString
            //     .split(',')
            //     .map((d) => d.trim())
            //     .forEach((sectorName: string) => {
            //         if (this.isValidSector(sectorName)) {
            //             sectorNames.push(sectorName);
            //         }
            //     });
            // create the return arry
            const sectors = new Array<IBedesTermSectorLink>();
            sectorNamesString.split(',').forEach((sectorName: string) => {
                if (sectorName && sectorName.toLowerCase() !== 'n/a') {
                    const found = this.sectors.find((d) => d._name.toLowerCase() === sectorName.trim().toLowerCase())
                    if (!found) {
                        throw new Error(`sector name ${sectorName} not found`);
                    }
                    sectors.push(<IBedesTermSectorLink>{_sectorId: found._id});
                }
            });
            return sectors;
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in buildSectors`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(sectorNamesString));
            throw error;
        }
    }
}
