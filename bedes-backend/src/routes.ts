import { Router } from 'express';
import { mountRoutes as mountBedesRoutes } from './bedes/routes';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { Response, Request } from 'express';

export function mountRoutes(router: Router) {
    mountBedesRoutes(router);
    router.get('*', (request: Request, response: Response) => {
        response.status(HttpStatusCodes.NotFound_404).send('Not found.');
    });
}
