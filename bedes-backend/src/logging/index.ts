import * as winston from "winston";
import appRoot from 'app-root-path';

var options = {
    file: {
      level: 'info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

  const logger = winston.createLogger({
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  function errorToString(error: Error): string {
      return `name: ${error.name}, message: ${error.message}, stack: ${error.stack ? error.stack.replace(",", "\n") : ""}`;
  }

  export { logger, errorToString }
