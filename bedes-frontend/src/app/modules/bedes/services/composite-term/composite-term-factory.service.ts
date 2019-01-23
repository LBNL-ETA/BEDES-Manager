import { CompositeTermService } from './composite-term.service';

export function compositeTermFactory(compositeTermServce: CompositeTermService) {
    return () => compositeTermServce.load();
  }
