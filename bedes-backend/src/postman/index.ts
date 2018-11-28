import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

let transporter = nodemailer.createTransport({
    host: 'smtp.lbl.gov',
    port: 25,
    secure: false, // true for 465, false for other ports
});

class Postman {
    constructor(
        public transporter: Transporter
    ) { }

    public sendEmail(to: string, subject: string, message: string): any {
        return new Promise((resolve, reject) => {
            logger.debug(`sendMail to ${to}: subject: ${subject} ->\n${message}`);
            resolve(true);

        });
        // const mailOptions = {
        //     from: 'mspears@lbl.gov',
        //     to: to,
        //     subject: subject,
        //     html: message
        //   };
        // return new Promise((resolve, reject) => {
        //     this.transporter.sendMail(mailOptions, function (err, info) {
        //         if(err) {
        //           console.log(err);
        //           reject(err);
        //         }
        //         else {
        //           console.log(info);
        //           resolve(true);
        //         }
        //      });
        // });
    }
}

const postman = new Postman(transporter);
export { postman };
