import { IAppTerm } from "../app-term";
import { IBedesTerm, IBedesConstrainedList } from "../bedes-term";
import { IMappedTerm } from "./mapped-term.interface";

export class MappedTerm {
    private _id: number | null | undefined;
    private _appId: number;
    // private _appTerms: Array<IAppTerm>;
    // private _bedesTerms: Array<IBedesTerm | IBedesConstrainedList>;

    constructor(data: IMappedTerm) {
        this._id = data._id;
        this._appId = data._appId;
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get appId(): number {
        return this._appId;
    }
    set appId(value: number) {
        this._appId = value;
    }
    // get appTerms(): Array<IAppTerm> {
    //     return this._appTerms;
    // }
    // set appTerms(value: Array<IAppTerm>) {
    //     this._appTerms = value;
    // }
    // get bedesTerms(): Array<IBedesTerm | IBedesConstrainedList> {
    //     return this._bedesTerms;
    // }
    // set bedesTerms(value: Array<IBedesTerm | IBedesConstrainedList>) {
    //     this._bedesTerms = value;
    // }
}