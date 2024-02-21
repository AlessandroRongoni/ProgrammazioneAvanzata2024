import fs from 'fs';
import path from 'path';
import { Response } from 'express';
// Per il formato CSV
import  {stringify} from 'csv-stringify';


/**
 * Salva i dati in un file e risponde con il file generato.
 * @param updates - Array di oggetti contenenti gli aggiornamenti da salvare nel file.
 * @param format - Formato del file da generare (csv, pdf, xml).
 * @param res - Oggetto Response per inviare la risposta al client.
 * @param graphInfo - Informazioni sul grafo (graph_id, user_id, name, description).
 * @returns Promise<void>
 */
export const saveAndRespondWithFile = async (updates: any[],format: string,res: Response,graphInfo: { graph_id: number; user_id:number, name: string; description: string;}) => {
    const filesDir = path.join(__dirname, '..', '..', 'generatedFiles');
    try{
    // Verifica se la cartella esiste, altrimenti creala
    if (!fs.existsSync(filesDir)){
        fs.mkdirSync(filesDir, { recursive: true });
      }
    switch (format.toLowerCase()) {
      // Definisci le colonne per il CSV
      case 'csv':
        // Estrai solo i dataValues da ogni oggetto in updates
        const cleanUpdates = updates.map(update => update.dataValues ? update.dataValues : update);
                
        // Definisci le colonne per il CSV
        const columns = {
            update_id: 'Update ID',
            graph_id: 'Graph ID',
            edge_id: 'Edge ID',
            requester_id: 'Requester ID',
            receiver_id: 'Receiver ID',
            new_weight: 'New Weight',
            approved: 'Approved',
            createdat: 'Created At',
            updatedat: 'Updated At'
        };

        // Gestisci la scrittura del file CSV
        const csvFilePath = path.join(filesDir, 'updates.csv');
        const csvStream = fs.createWriteStream(csvFilePath);

        stringify(cleanUpdates, { header: true, columns: columns }).pipe(csvStream);

        csvStream.on('finish', () => {
            res.header('Content-Type', 'text/csv');
            res.attachment('updates.csv');
            res.download(csvFilePath);
        });
        break;

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
        doc.text(`USER ID: ${graphInfo.user_id}`, { align: 'left' });
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
      const xmlData = js2xml({graphInfo, updates }, { compact: true, spaces: 4 });
      // Usa filesDir per salvare il file XML
      const xmlFilePath = path.join(filesDir, 'updates.xml');
      fs.writeFileSync(xmlFilePath, xmlData);
      res.header('Content-Type', 'application/xml');
      res.attachment('updates.xml');
      return res.send(xmlData);

    default:
      res.json([graphInfo, updates]);
  }} catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Errore nella generazione del file' });
  }
};
