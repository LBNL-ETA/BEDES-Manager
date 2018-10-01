import express = require('express');
import morgan from 'morgan';
import * as bodyParser from 'body-parser';
import { mountRoutes } from './routes';
import session from 'express-session';
import { logger } from './logging';

/**
 * Entry point for the ePB backend app.
 *
 * @class App
 */
class App {
    public express: express.Application;

    constructor() {
        this.express = express()
        // setup morgan to write to the winston logger
        // so the request information is logged along with any other info
        const morganOptions: morgan.Options = { 
            stream: {
                write: (str: string) => {
                    // if (str.match(/HTTP\/1.1" 2/)) {
                        logger.info(str);
                    // }
                    // else {
                    //     logger.error(str);
                    // }
                }
            }
        };
        this.express.use(morgan('combined', morganOptions));
        this.express.use(bodyParser.json({limit: '5mb'}));
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(
            session({
                secret: '1ZW3IH$*uDipaQcf^vflu',
                cookie: {
                    maxAge: 60 * 60 * 1000
                },
                resave: false,
                saveUninitialized: false
            })
        );
        this.express.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", process.env.MODE === "production" ? "http://production-server.lbl.gov" : "http://localhost:4200");
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

            next();
        });
        // mount the routes
        this.mountRoutes()
        logger.info(`Server starting ${new Date()}...`);
    }

    /**
     * Mounts all of the api routes.
     *
     * @private
     * @memberof App
     */
    private mountRoutes(): void {
        const router = express.Router()
        mountRoutes(router);
        // make all api calls have a prefix of api
        this.express.use('/api/', router)
    }
}

export default new App().express
