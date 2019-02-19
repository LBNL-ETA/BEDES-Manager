import multer from 'multer';
import path from 'path';

// configure the upload folder
export const UPLOAD_PATH = path.join(__dirname, 'files');
// export const UPLOAD_PATH = './files';
/** The multer middleware for attaching the uploaded file to the request. */
const upload = multer({ dest: `${UPLOAD_PATH}` });
export const uploadMiddleware  = upload.single('appTermImport');

console.log(`** upload path = ${UPLOAD_PATH}`);
