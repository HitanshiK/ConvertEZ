import express from 'express';
import multer from 'multer';
import { compressPDF, downloadFile } from './compress.controller.js';

const router = express.Router();

// Middleware for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/compress', upload.single('file'), compressPDF);
router.get('/download/:filename', downloadFile);

export default router;
