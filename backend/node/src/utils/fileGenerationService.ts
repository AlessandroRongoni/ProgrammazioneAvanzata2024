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
  res: Response,
  graphInfo: { graph_id: number; name: string; description: string;}
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
          const pdfFilePath = path.join(filesDir, 'updates.pdf');
          fs.writeFileSync(pdfFilePath, pdfData);
          res.header('Content-Type', 'application/pdf');
          res.attachment('updates.pdf');
          res.send(pdfData);
        });
      
        doc.fontSize(16).text(`Informazioni sul Grafo`, { align: 'center' });
        doc.fontSize(12).moveDown().text(`ID: ${graphInfo.graph_id}`, { align: 'left' });
        doc.text(`Nome: ${graphInfo.name}`, { align: 'left' });
        doc.text(`Descrizione: ${graphInfo.description}`, { align: 'left' });
        doc.moveDown().fontSize(14).text('Aggiornamenti svolti in questo grafo:', { align: 'center' });
        updates.forEach((update, index) => {
          doc.fontSize(10).moveDown().text(`Update ${index + 1}: ${JSON.stringify(update, null, 2)}`, { align: 'left' });
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
