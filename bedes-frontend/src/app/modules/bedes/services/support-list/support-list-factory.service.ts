import { SupportListService } from "./support-list.service";

export function supportListFactory(supportListService: SupportListService) {
    return () => supportListService.load();
  }
