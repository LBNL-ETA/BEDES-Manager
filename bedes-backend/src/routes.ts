import { Router } from 'express';
import { mountRoutes as mountScrapeRoutes } from './scrape/routes';

export function mountRoutes(router: Router) {
    mountScrapeRoutes(router);
}
