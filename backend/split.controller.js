// pdfController.js
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(path.resolve(), 'uploads');

export const splitPDF = async (req, res) => {
    try {
        const { file } = req;
        const { startPage, endPage } = req.body;
        const filePath = path.join(uploadsDir, file.filename);
        const outputFilePath = path.join(uploadsDir, `split_${Date.now()}_${file.originalname}`);
    
        const start = parseInt(startPage);
        const end = parseInt(endPage);
    
        const data = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(data);
        const totalPages = pdfDoc.getPageCount();
    
        if (start < 1 || end > totalPages || start > end) {
          return res.status(400).json({ message: 'Invalid page range' });
        }
    
        const splitDoc = await PDFDocument.create();
        for (let i = start - 1; i < end; i++) {
          const [copiedPage] = await splitDoc.copyPages(pdfDoc, [i]);
          splitDoc.addPage(copiedPage);
        }
    
        const splitPdfBytes = await splitDoc.save();
        fs.writeFileSync(outputFilePath, splitPdfBytes);
    
        res.json({ downloadUrl: `http://localhost:${process.env.PORT || 5000}/download/${path.basename(outputFilePath)}` });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error splitting PDF' });
      }      
};
export const downloadFile = (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    console.log('Download request for:', filePath);
  
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return res.status(404).send('File not found');
    }
  
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
    res.setHeader('Content-Type', 'application/octet-stream');
  
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).send(err);
      }
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
          console.log('File deleted:', filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }, 60000);
    });
  };
  
  
  
