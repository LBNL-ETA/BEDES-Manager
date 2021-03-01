/**
 * @file server.ts
 *
 * Entry point for Heroku. Do not use this file for local development.
 */
import 'module-alias/register';

import * as path from 'path';
import * as express from 'express';
import app from '@bedes-backend/App';

app.use(express.static(path.join(__dirname, '..', '..', 'Bedes-App')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', '..', 'Bedes-App', 'index.html'));
});
// Start the app by listening on the default Heroku port (or 8080 if local).
const port = process.env.PORT || 8080;
app.listen(port, (err: Error) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});
