import fs from 'fs';
import path from 'path';
import { Response } from 'express';

const filesDir = path.join(__dirname, '..', '..', 'generatedFiles');

// Verifica se la cartella esiste, altrimenti creala
if (!fs.existsSync(filesDir)){
    fs.mkdirSync(filesDir, { recursive: true });
}

export const saveAndRespondWithFile = async (
  updates: any[],
  format: string,
  res: Response
) => {
  switch (format.toLowerCase()) {
    case 'csv':
      const { stringify } = require('csv-stringify/sync');
      const csvData = stringify(updates, { header: true });
      // Usa filesDir per salvare il file CSV
      const csvFilePath = path.join(filesDir, 'updates.csv');
      fs.writeFileSync(csvFilePath, csvData);
      res.header('Content-Type', 'text/csv');
      res.attachment('updates.csv');
      return res.send(csvData);

    case 'pdf':
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      let pdfBuffers: Buffer[] = [];
      doc.on('data', pdfBuffers.push.bind(pdfBuffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(pdfBuffers);
        // Usa filesDir per salvare il file PDF
        const pdfFilePath = path.join(filesDir, 'updates.pdf');
        fs.writeFileSync(pdfFilePath, pdfData);
        res.header('Content-Type', 'application/pdf');
        res.attachment('updates.pdf');
        res.send(pdfData);
      });

      doc.fontSize(24).text('Aggiornamenti svolti in questo grafo:', { align: 'center' });
      updates.forEach((update) => {
        doc.moveDown().text(JSON.stringify(update, null, 2));
      });
      doc.end();
      break;

    case 'xml':
      const { js2xml } = require('xml-js');
      const xmlData = js2xml({ updates }, { compact: true, spaces: 4 });
      // Usa filesDir per salvare il file XML
      const xmlFilePath = path.join(filesDir, 'updates.xml');
      fs.writeFileSync(xmlFilePath, xmlData);
      res.header('Content-Type', 'application/xml');
      res.attachment('updates.xml');
      return res.send(xmlData);

    default:
      res.json(updates);
  }
};
