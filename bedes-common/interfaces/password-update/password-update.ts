
export class PasswordUpdate {
    private _password: string;
    get password(): string {
        return this._password;
    }
    private _passwordConfirm: string;

    constructor(password: string, passwordConfirm: string) {
        this._password = password;
        this._passwordConfirm = passwordConfirm;
        this.clean();
    }

    /**
     * Removes any extra surrounding spaces in the string.
     */
    private clean(): void {
        try {
            this._password = this._password.trim();
            this._passwordConfirm = this._passwordConfirm.trim();
        }
        catch (error) {
            console.log(`${this.constructor.name}: clean expects valid strings.`);
        }
    }

    public isValid(): boolean {
        if (typeof this._password !== 'string' || typeof this._passwordConfirm !== 'string') {
            // both should actually be strings
            return false;
        }
        else if (this._password.length && this._password === this._passwordConfirm) {
            return true;
        }
        else {
            return false;
        }
    }
}