import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { createLogger } from '@bedes-backend/logging';
import { smtpCredentials } from './smtp-credentials';
import Mail = require('nodemailer/lib/mailer');

const logger = createLogger(module);

// create the mail transport only if there's valid smtp settings
let transporter: Mail | undefined;
if (smtpCredentials.isValid()) {
    transporter = nodemailer.createTransport({
        host: smtpCredentials.host,
        port: smtpCredentials.getPortNumber(),
        secure: true,
        auth: {
            user: smtpCredentials.user,
            pass: smtpCredentials.pass,
        },
        requireTLS: true,
        pool: true,
        debug: true
    });
}

class BedesPostman {
    constructor(
        public transporter: Transporter | undefined
    ) { }

    public async sendEmail(to: string, subject: string, message: string): Promise<any> {
        const mailOptions = {
            from: 'bedes-manager@lbl.gov',
            to: to,
            subject: subject,
            html: message
          };
        return new Promise((resolve, reject) => {
            if (this.transporter) {
                console.log(mailOptions);
                this.transporter.sendMail(mailOptions, function (err, info) {
                    if(err) {
                        console.log('send mail error');
                        console.log(err);
                        reject(err);
                    }
                    else {
                        console.log('send mail success');
                        console.log(info);
                        resolve(true);
                    }
                });
            }
            else {
                console.error('SMTP settings not found, email not available');
                console.log(mailOptions);
            }
        });
    }
}

/** Sends emails with valid SMTP settings */
export const bedesPostman = new BedesPostman(transporter);
