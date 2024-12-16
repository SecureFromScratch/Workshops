import multer from 'multer';

export default multer({
  storage: multer.memoryStorage(), 
});
