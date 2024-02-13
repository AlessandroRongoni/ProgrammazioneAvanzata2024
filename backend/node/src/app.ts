// Importa le dipendenze necessarie
import express from 'express';
import { Sequelize } from 'sequelize';
import { Request, Response } from 'express';
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: 'http://pa2024',
  issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});

const app = express();
const port = 3000;

const db = new Sequelize('mysql://${MYSQL_ROOT}:password@mysql_db:3306/mydb') 

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


