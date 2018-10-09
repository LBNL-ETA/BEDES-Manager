import * as winston from "winston";
import appRoot from 'app-root-path';

const myFormat = winston.format.printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});
 
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [new winston.transports.Console({
    level: 'debug'
  })]
});



  // const logger = winston.createLogger({
  //   level: 'info',
  //   // format: winston.format.json(),
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.json()
  //   ),
  //   transports: [
  //     //
  //     // - Write to all logs with level `info` and below to `combined.log` 
  //     // - Write all logs error (and below) to `error.log`.
  //     //
  //     new winston.transports.File({ filename: 'error.log', level: 'error' }),
  //     new winston.transports.File({ filename: 'combined.log' }),
  //     new winston.transports.Console({ format: winston.format.simple(), level: 'debug' })
  //   ]
  // });
   
  // //
  // // If we're not in production then log to the `console` with the format:
  // // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // // 
  // if (process.env.NODE_ENV !== 'production') {
  //   logger.add(new winston.transports.Console({
  //     format: winston.format.simple()
  //   }));
  // }


  function errorToString(error: Error): string {
      return `\nname: ${error.name},\nmessage: ${error.message},\nstack: ${error.stack ? error.stack.replace(",", "\n") : ""}`;
  }

  export { logger, errorToString }
