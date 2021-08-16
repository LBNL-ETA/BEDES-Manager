import * as fs from 'fs';
import {createLogger} from '@script-common/logging';
import * as path from 'path';
import * as util from 'util';
import {BedesUnitManager} from '../term-loader/data-managers/unit-manager';
import {BedesUnit, IBedesUnit} from '@bedes-common/models/bedes-unit';
import {IBedesTermOption} from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
import {IBedesTermCategory} from '@bedes-common/models/bedes-term-category';
import * as xml2js from 'xml2js';
import {IXmlNodes} from './xml-nodes/xml-nodes.interface';
import {validXmlNode} from './xml-nodes/valid-xml-node';
import {xmlNodeToTermOption} from './xml-node-to-term-option';
import {bedesQuery} from '@bedes-backend/bedes/query';
import {IBedesSector} from '@bedes-common/models/bedes-sector/bedes-sector.interface';
import {IXmlTermOption} from '../../../bedes-common/models/xml-term/xml-term-option.interface';

const logger = createLogger(module);

/**
 * Load's the BEDES term options from BEDES_all-list-options_V2-2.xml
 */
export class XmlTermOptionLoader {
    private filePath: string;
    private fileName: string;
    private units: Array<IBedesUnit>;
    private categories: Array<IBedesTermCategory>;
    private sectors: Array<IBedesSector>;
    private unitManager: BedesUnitManager;

    constructor(filePath: string, fileName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.units = new Array<IBedesUnit>();
        this.categories = new Array<IBedesTermCategory>();
        this.sectors = new Array<IBedesSector>();
        this.unitManager = new BedesUnitManager();
    }

    /**
     * Runs term loader.
     */
    public async run(): Promise<any> {
        try {
            const xml: IXmlNodes = await this.openFile();
            await this.loadLookupTables();
            return this.loadXml(xml);
        } catch (error) {
            logger.error(`${this.constructor.name}: unable to load the xml term file.`);
        }
    }

    /**
     * Load's the lookup tables from the database.
     */
    public async loadLookupTables(): Promise<any> {
        try {
            const promises = new Array<Promise<Array<any>>>();
            promises.push(bedesQuery.units.getAllRecords());
            promises.push(bedesQuery.termCategory.getAllRecords());
            promises.push(bedesQuery.sector.getAllRecords());
            // wait for all promises to resolve
            [this.units, this.categories, this.sectors] = await Promise.all(promises);
            console.log(this.sectors);
        } catch (error) {
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
            } catch (error) {
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
                const xmlTerm = xmlNodeToTermOption(node);
                await this.processTerm(xmlTerm);
                // logger.debug('created term');
                // logger.debug(util.inspect(xmlTerm));
                // break
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: error in loadXml`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async processTerm(xmlTermOption: IXmlTermOption): Promise<any> {
        let dataChanged = false;
        if (!xmlTermOption.listOption) {
            throw new Error('xmlTerm requires a list option name');
        } else if (!xmlTermOption.relatedTermUUID) {
            logger.warn('Missing related-term-uuid');
            console.log(xmlTermOption);
            // throw new Error('Missing related-term-uuid');
            return;
        }
        // first find the BedesTerm that the list option belongs to.
        let bedesTerm = await bedesQuery.terms.getRecordByUUID(xmlTermOption.relatedTermUUID);
        if (!bedesTerm) {
            logger.error(`${this.constructor.name}: BedesTerm not found for xmlTermOption:`);
            logger.error(bedesTerm);
            console.log(xmlTermOption);
            throw new Error('bedesTerm not found');
        }
        // get the list option object by name
        let termOption: IBedesTermOption;
        try {
            termOption = await bedesQuery.termListOption.getRecordByName(xmlTermOption.relatedTermUUID, xmlTermOption.listOption);
        } catch (error) {
            logger.error(`${this.constructor.name}: can't find list term option`);
            console.log(xmlTermOption);
            // throw new Error('listOption ${} not found');
            return;
        }
        // term unit id
        if (xmlTermOption.unitName && typeof xmlTermOption.unitName === 'string') {
            // @ts-ignore
            const termUnit = this.units.find((d) => d._name.toLowerCase() === xmlTermOption.unitName.toLowerCase());
            if (!termUnit) {
                logger.error(`couldn't find matching unit name for xml term`);
                logger.error(util.inspect(xmlTermOption));
                logger.error(util.inspect(bedesTerm));
                console.log(this.units);
                throw new Error(`Invalid TermCategoryId (${bedesTerm._termCategoryId})`);
            } else if (termUnit._id !== termOption._unitId) {
                logger.error('termCategoryId does not match');
                logger.error(util.inspect(termUnit));
                logger.error(util.inspect(bedesTerm));
                throw new Error(`XML <-> BedesTerm category do not match`);
            }
        }
        // update uuid and url
        if (!termOption._uuid && xmlTermOption.uuid) {
            termOption._uuid = xmlTermOption.uuid;
            dataChanged = true;
        }
        if (!termOption._url && xmlTermOption.url) {
            termOption._url = xmlTermOption.url;
            dataChanged = true;
        }

        if (dataChanged) {
            return bedesQuery.termListOption.updateRecord(termOption);
        }

        if (xmlTermOption.relatedTerm === 'Unit Of Measure' && xmlTermOption.listOption) {
            const listOptionLower = xmlTermOption.listOption.toLowerCase();
            const listOptionAsUnit = this.units.find((d) => d._name.toLowerCase() === listOptionLower);

            if (!listOptionAsUnit) {
                const newUnit = this.unitManager.getOrCreateItem(xmlTermOption.listOption);
                if (!newUnit) {
                    logger.error(`Failed to create new unit ${xmlTermOption.listOption} from BEDES term Unit Of Measure.`);
                    logger.error(util.inspect(xmlTermOption));
                    throw new Error(`Failed to create new unit ${xmlTermOption.listOption} from BEDES term Unit Of Measure.`);
                }

                logger.debug(`Found and added new unit in BEDES term Unit Of Measure:`);
                logger.debug(util.inspect(newUnit));
            }
        }
    }

    async collectTermOptions(): Promise<IXmlTermOption[]> {
        const xml: IXmlNodes = await this.openFile();

        let xmlTermOptions = [];
        try {
            logger.debug('collectTermOptions...');
            for (let node of xml.nodes.node) {
                // logger.debug(util.inspect(node));
                if (!validXmlNode(node)) {
                    throw new Error(`Invalid xml Node`);
                }
                xmlTermOptions.push(xmlNodeToTermOption(node));
            }

            return xmlTermOptions;
        } catch (error) {
            logger.error(`${this.constructor.name}: error in loadXml`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Get the BedesUnit object for the given name.
     * If the name doesn't exist it should be created.
     * @param name
     * @returns bedes unit
     */
    private async getBedesUnit(name: string): Promise<BedesUnit> {
        try {
            let item = await this.unitManager.getOrCreateItem(name);
            if (item) {
                return item;
            } else {
                throw new Error(`Unable to get the bedes unit ${name}`);
            }
        } catch (error) {
            logger.error('Error retrieving BedesUnit record');
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
