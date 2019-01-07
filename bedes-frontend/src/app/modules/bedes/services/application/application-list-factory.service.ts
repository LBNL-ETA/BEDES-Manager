import { ApplicationService } from './application.service';

export function applicationListFactory(applicationService: ApplicationService) {
    return () => applicationService.load();
  }
