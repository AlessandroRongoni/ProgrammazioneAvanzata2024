// Importa le dipendenze necessarie
import express from 'express';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
//import { DbConnector } from './db/db_connection';

import { Request, Response } from 'express';
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: 'http://pa2024',
  issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});



const app = express();
const port = 3000;
const host = '0.0.0.0';




app.get('/', async (req: Request, res: Response) => {
  res.send('Ciao, mondo!');
});



app.get('/history', checkJwt, (req: Request, res: Response) => {
  res.send('Questa è una rotta protetta perchè è la cronologia di chrome!');
});

app.listen(port,host, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});


