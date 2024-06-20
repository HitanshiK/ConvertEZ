import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(path.resolve(), 'uploads');

export const compressPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, `compressed-${Date.now()}-${req.file.originalname}`);

    const pdfData = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfData);
    
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      updateFieldAppearances: true,
    });

    fs.writeFileSync(outputPath, compressedPdfBytes);

    res.json({ downloadUrl: `http://localhost:${process.env.PORT || 5000}/api/pdf/download/${path.basename(outputPath)}` });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    res.status(500).send(error);
  }
};

export const downloadFile = (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  console.log('Download request for:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return res.status(404).send('File not found');
  }

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
};
