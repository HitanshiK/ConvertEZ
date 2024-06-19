import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib'; // Import the pdf-lib library
import docxPdf from 'docx-pdf';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

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
    const inputPath = req.file.path;
    const outputPath = `uploads/${req.file.originalname.replace('.docx', '.pdf')}`;

    docxPdf(inputPath, outputPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      const downloadUrl = `http://localhost:5000/${outputPath}`;
      res.json({ downloadUrl });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


// Route to handle merging PDFs
app.post('/merge', upload.array('files', 10), async (req, res) => {
  try {
    const pdfDoc = await PDFDocument.create();
    
    for (const file of req.files) {
      const fileBuffer = fs.readFileSync(file.path);
      const donorPdfDoc = await PDFDocument.load(fileBuffer);
      const copiedPages = await pdfDoc.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
      copiedPages.forEach((page) => {
        pdfDoc.addPage(page);
      });
    }
    
    const outputPdfBytes = await pdfDoc.save();
    const outputPath = `uploads/merged.pdf`;
    fs.writeFileSync(outputPath, outputPdfBytes);

    const downloadUrl = `http://localhost:5000/${outputPath}`;
    res.json({ downloadUrl });
  } catch (error) {
    res.status(500).send(error);
  }
});


// Fix for __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve the uploads directory to access the converted PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
