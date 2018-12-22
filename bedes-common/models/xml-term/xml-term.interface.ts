export interface IXmlTerm {
    uuid?: string | null | undefined;
    url?: string | null | undefined;
    name: string;
    definition?: string | null | undefined;
    dataTypeName?: string | null | undefined;
    unitName?: string | null | undefined;
    categoryName?: string | null | undefined;
    sectorNames?: Array<string> | null | undefined;
    applicationNames?: Array<string> | null | undefined;
    updatedDate?: string | null | undefined;
}
