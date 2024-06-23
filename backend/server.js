import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib'; // Import the pdf-lib library
import docxPdf from 'docx-pdf';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import splitRouter from './split.routes.js';
import compressRouter from './compress.route.js';
import mergeRouter from './merge.route.js';
import dotenv from 'dotenv';
//dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __dirname1 = path.resolve();

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port

/*/const allowedOrigins = ['https://convertez.onrender.com','http://localhost:5173']; // Add all allowed origins

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};*/

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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

// Route to handle file upload and conversion
app.post('/', upload.single('file'), (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `uploads/${req.file.originalname.replace('.docx', '.pdf')}`;

    docxPdf(inputPath, outputPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      
      res.setHeader('Content-Disposition', 'attachment; filename=' + req.file.originalname.replace('.docx', '.pdf'));
      const downloadUrl = `http://localhost:${port}/api/pdf/download/${path.basename(outputPath)}`;
      res.json({ downloadUrl });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to handle file download
app.get('/api/pdf/download/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  console.log('Download request for:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return res.status(404).send('File not found');
  }

  res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.filename); // Set the Content-Disposition header
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return res.status(500).send(err);
    }
    // Optional: Delay the deletion of the file
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        console.log('File deleted:', filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }, 60000); // Delete after 1 minute
  });
});

// Serve the uploads directory to access the converted PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname1, 'client/dist')));

// Fallback route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname1, 'client/dist', 'index.html'));
});

// API routes
app.use('/api/pdf', splitRouter);
app.use('/api/pdf', compressRouter);
app.use('/api/pdf', mergeRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
