import { IAppTermAdditionalInfo } from "./app-term-additional-info.interface";

export interface IAppTerm {
    _id: number | null | undefined;
    _appId: number;
    _fieldCode: string;
    _name: string;
    _description: string | null | undefined;
    _additionalInfo: Array<IAppTermAdditionalInfo>;
}