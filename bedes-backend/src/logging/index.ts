import * as winston from "winston";
import path from 'path';
import { cyan } from 'colors';

const myFormat = winston.format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

// Return the last folder name in the path and the calling
// module's filename.
function getLabel (callingModule: NodeModule): string {
    var parts = callingModule.filename.split(path.sep);
    if (parts && parts.length >= 2) {
        return path.join(parts[parts.length - 2], parts[parts.length - 1]);
    }
    else {
        return '';
    }
};

/**
 * Builds a logger for a specific module.
 * @param callingModule 
 * @returns  
 */
export function createLogger(callingModule: NodeModule) {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.label({ label: cyan(getLabel(callingModule))}),
            winston.format.colorize(),
            myFormat
        ),
        transports: [new winston.transports.Console({
            level: process.env.LOG_LEVEL_CONSOLE ? process.env.LOG_LEVEL_CONSOLE : 'debug'
        })]
    });
};
