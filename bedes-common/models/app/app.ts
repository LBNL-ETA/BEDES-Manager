import { IApp } from "./app.interface";

export class App {
    private _id: number | null | undefined;
    private _name: string;

    constructor(data: IApp) {
        this._id = data._id;
        this._name = data._name
    }

    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

}