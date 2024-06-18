import express from 'express';
import multer from 'multer';
import docxPdf from 'docx-pdf';
import path from 'path';
import { unlinkSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
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
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    console.log('Uploaded file:', req.file);

    const inputPath = req.file.path;
    const outputPath = `uploads/${req.file.originalname.replace('.docx', '.pdf')}`;

    docxPdf(inputPath, outputPath, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      console.log('Converted file saved at:', outputPath);
      res.json({ downloadUrl: `http://localhost:${port}/download/${path.basename(outputPath)}` });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to handle file download
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  console.log('Download request for:', filePath); // Add this line for debugging

  if (!existsSync(filePath)) {
    console.error('File does not exist:', filePath); // Add this line for debugging
    return res.status(404).send('File not found');
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err); // Add this line for debugging
      return res.status(500).send(err);
    }
    // Optional: Delay the deletion of the file
    setTimeout(() => {
      try {
        unlinkSync(filePath);
        console.log('File deleted:', filePath); // Add this line for debugging
      } catch (error) {
        console.error('Error deleting file:', error); // Add this line for debugging
      }
    }, 60000); // Delete after 1 minute
  });
});

// Serve the uploads directory to access the converted PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
