var express = require('express');
import { Request, Response } from "express";
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { checkEmail } from "./middleware/email_middleware"; // Import the missing checkEmail function
import { checkPassword } from "./middleware/password_middleware"; // Import the missing checkPassword function
import { getUserTokens, login, createUser} from './controllers/controller';

const { auth } = require('express-oauth2-jwt-bearer');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST;

const checkJwt = auth({
  audience: 'http://pa2024',
  issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Home
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Effettua il login per usare l'applicazione");
});
/**
 * Effettua il login e restituisce il jwt associato all'utente
 */
app.post("/login", jsonParser, checkEmail, checkPassword, (req: Request, res: Response) => {
  login(req, res);
});

/**
 * Registra un nuovo utente
 */

app.post("/register", jsonParser, checkEmail, checkPassword, (req: Request, res: Response) => {
  createUser(req, res);
});

/**
* Restituisce i token associati ad un utente
*/

app.get("/user/tokens", checkJwt, (req: Request, res: Response) => {
  getUserTokens(req, res);
});


app.listen(port,host, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});


