import { UserPasswordHash } from './password-hash';

export class UserPasswordUpdate extends UserPasswordHash {
    constructor(
        public id: number,
        password: string,
        public passwordConfirm: string
    ) {
        super(password);
    }

    public isValid(): boolean {
        if (super.isValid() && this.password === this.passwordConfirm && this.id) {
            return true;
        }
        else {
            return false;
        }
    }
}
