class SmtpCreds {
    constructor(
        public host: string | undefined,
        public port: string | undefined,
        public user: string | undefined,
        public pass: string | undefined
    ) {}

    public isValid(): boolean {
        if (
           this.validHost() 
           && this.validPort()
           && this.validUser()
           && this.validPass()
        ) {
            return true;
        }
        else {
            return false
        }
    }

    public validHost(): boolean {
        return typeof this.host !== 'string' || !this.host
            ? false : true;
    }

    public validPort(): boolean {
        return !this.port || typeof this.port !== 'string' || !this.port.match(/^\d+$/)
            ? false : true;
    }

    public validUser(): boolean {
        return !this.user || typeof this.user !== 'string'
            ? false : true;
    }

    public validPass(): boolean {
        return !this.pass || typeof this.pass !== 'string'
            ? false : true;
    }

    public getPortNumber(): number {
        if (!this.port) {
            throw new Error('Invalid port string');
        }
        return +this.port;
    }
}

/** The SMTP server credentials */
export const smtpCredentials = new SmtpCreds(
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASSWORD
)