// Importa le dipendenze necessarie
import express from 'express';
import { Request, Response } from 'express';
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: 'http://pa2024',
  issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Ciao Mondo con Express e TypeScript!');
});

app.get('/history', checkJwt, (req: Request, res: Response) => {
  res.send('Questa è una rotta protetta perchè è la cronologia di chrome!');
});

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});


