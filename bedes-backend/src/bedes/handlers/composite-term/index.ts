import { compositeTermPostHandler } from './post-handler';
import { compositeTermGetHandler } from './get-handler';
import { compositeTermGetCompleteHandler } from './get-complete-handler';
import { compositeTermGetAllHandler } from './get-all-terms';
import { deleteCompositeTermHandler } from './delete-handler';
import { compositeTermPutHandler } from './put-handler';
import { getCompositeTermDetailInfoHandler } from './get-detail-info-handler';
import { deleteCompositeTermDetailHandler } from './delete-detail-handler';

export {
    compositeTermPostHandler as post,
    compositeTermGetCompleteHandler as get,
    getCompositeTermDetailInfoHandler as getDetailInfo,
    compositeTermGetAllHandler as getAll,
    deleteCompositeTermHandler as delete,
    compositeTermPutHandler as put,
    deleteCompositeTermDetailHandler as deleteDetail
}
