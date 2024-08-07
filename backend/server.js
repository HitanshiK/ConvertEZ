import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import splitRouter from './split.routes.js';
import compressRouter from './compress.route.js';
import mergeRouter from './merge.route.js';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer'; // Import Puppeteer

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __dirname1 = path.resolve();

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port

app.use(cors());

const uploadsDir = path.join(__dirname, '..', 'uploads');
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

const localUrl = 'http://localhost:5000';
const productionUrl = 'https://convertez.onrender.com';
const apiUrl = process.env.NODE_ENV === 'production' ? productionUrl : localUrl;

// Function to convert HTML to PDF using Puppeteer
async function convertToPdf(inputPath, outputPath) {
  console.log(`Converting file: ${inputPath} to ${outputPath}`);
  
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for certain environments
    });
    
    const page = await browser.newPage();
    
    // Read the HTML content from the uploaded file
    const htmlContent = fs.readFileSync(inputPath, 'utf8');
    
    // Set the page content to the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate a PDF from the page content
    await page.pdf({ path: outputPath, format: 'A4' });
    
    await browser.close();
    
    console.log('PDF conversion completed successfully.');
  } catch (error) {
    console.error('Error converting to PDF:', error.message);
    throw error;
  }
}

// Route to handle file upload and conversion
app.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).send('No file uploaded');
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, req.file.originalname.replace('.docx', '.pdf'));

    await convertToPdf(inputPath, outputPath);

    const downloadUrl = `${apiUrl}/api/pdf/download/${path.basename(outputPath)}`;
    console.log(`Conversion successful, download URL: ${downloadUrl}`);
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Upload and conversion error:', error.message);
    console.error(error.stack); // Log the stack trace
    res.status(500).send('Internal Server Error');
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
      console.error('Error downloading file:', err.message);
      console.error(err.stack); // Log the stack trace
      return res.status(500).send(err);
    }
    // Optional: Delay the deletion of the file
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        console.log('File deleted:', filePath);
      } catch (error) {
        console.error('Error deleting file:', error.message);
        console.error(error.stack); // Log the stack trace
      }
    }, 60000); // Delete after 1 minute
  });
});

// Serve the uploads directory to access the converted PDFs
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname1, 'client', 'dist')));

// Fallback route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname1, 'client', 'dist', 'index.html'));
});

// API routes
app.use('/api/pdf', splitRouter);
app.use('/api/pdf', compressRouter);
app.use('/api/pdf', mergeRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
