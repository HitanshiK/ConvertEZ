import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(path.resolve(), 'uploads');
const localUrl = 'http://localhost:5000';
const productionUrl = 'https://convertez.onrender.com';
const apiUrl = process.env.NODE_ENV === 'production' ? productionUrl : localUrl;

export const mergePDFs = async (req, res) => {
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
    const outputPath = path.join(uploadsDir, `merged-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, outputPdfBytes);

    const downloadUrl = `${apiUrl}/api/pdf/download/${path.basename(outputPath)}`;
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Error merging PDFs');
  }
};

export const downloadFile = (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return res.status(404).send('File not found');
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return res.status(500).send('Error downloading file');
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
};
