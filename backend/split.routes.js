// pdfRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { splitPDF, downloadFile } from './split.controller.js';
import fs from 'fs';

const router = express.Router();

const uploadsDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/split', upload.single('file'), splitPDF);
router.get('/download/:filename', downloadFile);

export default router;
