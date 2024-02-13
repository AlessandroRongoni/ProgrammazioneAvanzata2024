// Importa le dipendenze necessarie
import express from 'express';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import { Request, Response } from 'express';
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: 'http://pa2024',
  issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const dbUsername = process.env.MYSQL_ROOT;
const dbPassword = process.env.MYSQL_PASSWORD; // Assicurati di avere questa variabile definita nel tuo .env
const dbName = process.env.MYSQL_DB_NAME || 'mydb'; // Fornisce un valore di default se MYSQL_DB_NAME non è definito
const dbHost = process.env.MYSQL_HOST || 'mysql_db'; // Fornisce un valore di default se MYSQL_HOST non è definito
const dbPort = process.env.MYSQL_PORT || '3306'; // Fornisce un valore di default se MYSQL_PORT non è definito



const app = express();
const port = 3000;

const db = new Sequelize(`mysql://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`);

app.get('/', async (req: Request, res: Response) => {
  try {
    await db.authenticate();
    res.send('Connection has been established successfully.');
  } catch (error) {
    res.send('Unable to connect to the database:');
  }
});

app.get('/history', checkJwt, (req: Request, res: Response) => {
  res.send('Questa è una rotta protetta perchè è la cronologia di chrome!');
});

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});


