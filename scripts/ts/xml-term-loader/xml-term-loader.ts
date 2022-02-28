import * as fs from 'fs';
import {createLogger} from "@script-common/logging";
import * as path from 'path';
import * as util from 'util';
import {BedesUnit, IBedesUnit} from "@bedes-common/models/bedes-unit";
import {
    BedesDataType,
    IBedesDataType
} from "@bedes-common/models/bedes-data-type";
import {
    BedesTermCategory,
    IBedesTermCategory
} from "@bedes-common/models/bedes-term-category";
import * as xml2js from 'xml2js';
import {IXmlNodes} from './xml-nodes/xml-nodes.interface';
import {validXmlNode} from './xml-nodes/valid-xml-node';
import {xmlNodeToTerm} from './xml-node-to-term';
import {IXmlTerm} from '../../../bedes-common/models/xml-term/xml-term.interface';
import {bedesQuery} from '@bedes-backend/bedes/query';
import {IBedesSector} from '@bedes-common/models/bedes-sector/bedes-sector.interface';
import {IBedesTermSectorLink} from '../../../bedes-common/models/bedes-term-sector-link/bedes-term-sector-link.interface';
import {BedesTermManager} from "@app-root/data-managers/bedes-term-manager";
import {errors as pgErrors} from 'pg-promise';
import {
    BedesConstrainedList,
    BedesTerm,
    IBedesConstrainedList,
    IBedesTerm
} from "@bedes-common/models/bedes-term";
import {BedesTermCategoryManager} from "@app-root/data-managers/term-category-manager";
import {BedesDataTypeManager} from "@app-root/data-managers/data-type-manager";
import {BedesUnitManager} from "@app-root/data-managers/unit-manager";
import {BedesDefinitionSource} from "@bedes-common/models/bedes-definition-source";
import {BedesDefinitionSourceManager} from "@app-root/data-managers/definition-source-manager";
import {XmlTermOptionLoader} from "../xml-term-option-loader/xml-term-option-loader";
import {IXmlTermOption} from "@bedes-common/models/xml-term/xml-term-option.interface";
import {
    BedesTermOption,
    IBedesTermOption
} from "@bedes-common/models/bedes-term-option";

const logger = createLogger(module);

/**
 * Load's the BEDES terms from BEDES_all-terms_V2-2.xml
 */
export class XmlTermLoader {
    private readonly filePath: string;
    private readonly fileName: string;
    private dataTypes: Array<IBedesDataType>;
    private units: Array<IBedesUnit>;
    private categories: Array<IBedesTermCategory>;
    private sectors: Array<IBedesSector>;
    private termManager: BedesTermManager;
    private termCategoryManager: BedesTermCategoryManager;
    private dataTypeManager: BedesDataTypeManager;
    private unitManager: BedesUnitManager;
    private definitionSourceManager: BedesDefinitionSourceManager;
    private termOptionsByRelatedUUID: IXmlTermOption[];
    private resetTermOptions: boolean;

    constructor(filePath: string, fileName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.dataTypes = new Array<IBedesDataType>();
        this.units = new Array<IBedesUnit>();
        this.categories = new Array<IBedesTermCategory>();
        this.sectors = new Array<IBedesSector>();
        this.termManager = new BedesTermManager();
        this.termCategoryManager = new BedesTermCategoryManager();
        this.dataTypeManager = new BedesDataTypeManager();
        this.unitManager = new BedesUnitManager();
        this.definitionSourceManager = new BedesDefinitionSourceManager();
        this.termOptionsByRelatedUUID = [];
        this.resetTermOptions = true;
    }

    /**
     * Runs term loader.
     */
    public async run(): Promise<any> {
        try {
            const xml: IXmlNodes = await this.openFile();
            await this.loadLookupTables();
            logger.debug('received xml');
            return this.loadXml(xml);
        } catch (error) {
            logger.error(`${this.constructor.name}: unable to load the xml term file.`);
        }
        logger.debug('exit run()');
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
            logger.debug(this.sectors);
        } catch (error) {
            logger.error(`${this.constructor.name}: error loading lookup tables`);
            logger.error(util.inspect(error));
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
                const xmlTerm = xmlNodeToTerm(node);
                logger.debug(`Processing term ${xmlTerm.name}`);
                logger.debug(util.inspect(xmlTerm));
                await this.processTerm(xmlTerm);
            }
        } catch (error) {
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
        let bedesTerm: IBedesTerm | IBedesConstrainedList;
        try {
            bedesTerm = await bedesQuery.terms.getRecordByName(xmlTerm.name);
        }
            // Create the term if it does not exist.
        catch (error) {
            if (typeof error === 'object' && error.code === pgErrors.queryResultErrorCode.noData) {
                logger.debug(`Term ${xmlTerm.name} not found. Creating.`)
                // Create the term or constrained list.
                let newTerm: BedesTerm | BedesConstrainedList;
                if (xmlTerm.dataTypeName && xmlTerm.dataTypeName.match(/constrained list/i)) {
                    newTerm = await this.buildConstrainedList(xmlTerm);

                    try {
                        // Cache all term options by UUID.
                        if (this.resetTermOptions) {
                            // Save the term or constrained list.
                            const filePath = '../../bedes-mappings';
                            const fileName = 'BEDES_all_list_options_V2-5.xml';

                            console.log(`load file ${filePath}/${fileName}`)
                            const termLoader = new XmlTermOptionLoader(filePath, fileName);
                            this.termOptionsByRelatedUUID = await termLoader.collectTermOptions();
                            this.resetTermOptions = false;
                        }

                        // Find the options that relate to this term's UUID.
                        const currentXmlTermOptions = this.termOptionsByRelatedUUID.filter((xmlTermOption) => {
                            return xmlTermOption.relatedTermUUID === newTerm.uuid;
                        });

                        for (let termOption of currentXmlTermOptions) {
                            if (newTerm instanceof BedesConstrainedList) {
                                logger.debug(`Adding option ${termOption.listOption}`);
                                await newTerm.addOption(await this.buildBedesListOption(termOption));
                            }
                        }
                    } catch (error) {
                        logger.error('Error collecting term options by UUID');
                        throw error;
                    }
                } else {
                    newTerm = await this.buildBedesTerm(xmlTerm);
                }

                let bedesTermResult: BedesTerm;

                if (newTerm instanceof BedesConstrainedList) {
                    bedesTermResult = await this.termManager.writeConstrainedList(newTerm);
                } else {
                    bedesTermResult = await this.termManager.writeTerm(newTerm);
                }
                logger.debug('Term creation result');
                logger.debug(util.inspect(bedesTermResult));
                bedesTerm = bedesTermResult.toInterface();
                logger.debug(`Term ${xmlTerm.name} created.`)
                // Reload new data.
                // @todo: Improve performance of this if it's bad, or take out the updating code altogether.
                await this.loadLookupTables();
            } else {
                logger.error('Term creation failed unexpectedly.');
                logger.error(util.inspect(xmlTerm));
                throw new Error('Term creation failed unexpectedly.');
            }
        }
        // term category id
        const termCategory = this.categories.find((d) => d._name === xmlTerm.categoryName);
        if (!termCategory) {
            logger.error(`couldn't find matching term category for xml term`);
            logger.error(util.inspect(xmlTerm));
            logger.error(util.inspect(bedesTerm));
            console.log(this.categories);
            throw new Error(`Invalid TermCategoryId (${bedesTerm._termCategoryId})`)
        } else if (termCategory._id !== bedesTerm._termCategoryId) {
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
        } else if (dataType._id !== bedesTerm._dataTypeId) {
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
        } catch (error) {
            logger.error(`${this.constructor.name}: error in buildSectors`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(sectorNames));
            throw error;
        }
    }

    private async getTermCategory(categoryName: string): Promise<BedesTermCategory> {
        // get the term type for this set of terms
        // corresponds to the worksheet names
        try {
            return this.termCategoryManager.getOrCreateItem(categoryName);
        } catch (error) {
            logger.error(`Error retrieving TermCategory ${categoryName}`);
            throw error;
        }
    }

    private async getBedesDataType(name: string): Promise<BedesDataType> {
        try {
            return this.dataTypeManager.getOrCreateItem(name);
        } catch (error) {
            logger.error('Error retrieving BedesDataType record');
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

    private async getDefinitionSource(definitionSource: string): Promise<BedesDefinitionSource> {
        try {
            return this.definitionSourceManager.getOrCreateItem(definitionSource);
        } catch (error) {
            logger.error('Error building DefinitionSource for rowItem:');
            logger.error(util.inspect(definitionSource));
            throw new Error('Error building BedesDefinitionSource.');
        }
    }

    private async buildBedesTerm(xmlTerm: IXmlTerm): Promise<BedesTerm> {
        try {
            if (!xmlTerm.categoryName) {
                throw new Error('Missing category.');
            }
            if (!xmlTerm.dataTypeName) {
                throw new Error('Missing data type');
            }
            if (!xmlTerm.unitName) {
                xmlTerm.unitName = "n/a";
            }

            const termCategory = await this.getTermCategory(xmlTerm.categoryName);
            const termCategoryId = termCategory.id;
            let dataType = await this.getBedesDataType(xmlTerm.dataTypeName);
            let unit = await this.getBedesUnit(xmlTerm.unitName);
            let definitionSourceId: number | undefined | null;
            // This is not really in use anymore, but preserved just in case.
            // We have typically treated each collection of definition sources
            // as a separate source in the DB, so the same pattern is used here.
            if (xmlTerm.applicationNames) {
                let item = await this.getDefinitionSource(xmlTerm.applicationNames.join('/'));
                definitionSourceId = item.id;
            }
            // NOTE: Sectors get addressed later.
            const params = <IBedesTerm>{
                _uuid: xmlTerm.uuid,
                _url: xmlTerm.url,
                _termCategoryId: termCategoryId,
                _name: xmlTerm.name,
                _description: xmlTerm.definition,
                _dataTypeId: dataType.id,
                _unitId: unit.id,
                _definitionSourceId: definitionSourceId
            }
            return new BedesTerm(params);
        } catch (error) {
            logger.error('error writing term');
            logger.error(util.inspect(xmlTerm))
            util.inspect(error);
            throw new Error('Unable to build BedesTerm');
        }
    }

    private async buildConstrainedList(xmlTerm: IXmlTerm): Promise<BedesConstrainedList> {
        return new BedesConstrainedList(<IBedesConstrainedList>(await this.buildBedesTerm(xmlTerm)).toInterface())
    }

    private async buildBedesListOption(xmlItem: IXmlTermOption): Promise<BedesTermOption> {
        if (!xmlItem.unitName) {
            // set unit to n/a if it is blank
            xmlItem.unitName = "n/a";
        }
        if (!xmlItem.listOption) {
            logger.error('List option missing name.');
            logger.error(util.inspect(xmlItem));
            throw new Error('List option missing name.');
        }
        let unit = await this.getBedesUnit(xmlItem.unitName);
        // get the definition source id
        let definitionSourceId: number | undefined | null;
        if (xmlItem.applicationNames) {
            let item = await this.getDefinitionSource(xmlItem.applicationNames.join('/'));
            definitionSourceId = item.id;
        }
        const params = <IBedesTermOption>{
            _name: xmlItem.listOption,
            _description: xmlItem.listOptionDefinition,
            _unitId: unit.id,
            _definitionSourceId: definitionSourceId,
            _url: xmlItem.url,
            _uuid: xmlItem.uuid,
        };
        return new BedesTermOption(params);
    }
}
