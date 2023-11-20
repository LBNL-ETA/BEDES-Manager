import * as winston from "winston";
import path from 'path';
import { cyan } from 'colors';

interface TransformableInfo {
    timestamp?: string;
    label?: string;
    level: string;
    message: string;
}

const myFormat = winston.format.printf((info: TransformableInfo) => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

// Return the last folder name in the path and the calling
// module's filename.
function getLabel (callingModule: NodeModule): string {
    var parts = callingModule.filename.split(path.sep);
    if (parts && parts.length >= 3) {
        return path.join(parts[parts.length-3], parts[parts.length - 2], parts[parts.length - 1]);
    }
    else if (parts && parts.length >= 2) {
        return path.join(parts[parts.length - 2], parts[parts.length - 1]);
    }
    else {
        return '';
    }
};

export function createLogger(callingModule: NodeModule) {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.label({ label: cyan(getLabel(callingModule))}),
            winston.format.colorize(),
            myFormat
        ),
        transports: [new winston.transports.Console({
            // level: process.env.BACKEND_DEBUG ? 'debug' : 'info'
            // level: 'info'
            level: process.env.LOG_LEVEL_CONSOLE ? process.env.LOG_LEVEL_CONSOLE : 'debug'
        })]
    });
};
