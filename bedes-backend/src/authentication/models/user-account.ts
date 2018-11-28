export class UserAccount {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string,
        public organization: string,
        public password: string,
        public passwordConfirm: string
    ) {}

    public isValid(): boolean {
        if (this.firstName && this.lastName && this.email && this.organization && this.password && this.password === this.passwordConfirm) {
            return true;
        }
        else {
            return false;
        }
    }
}
