"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importa le dipendenze necessarie
const express_1 = __importDefault(require("express"));
const { auth } = require('express-oauth2-jwt-bearer');
const checkJwt = auth({
    audience: 'http://pa2024',
    issuerBaseURL: `https://dev-a6vmtmzxl868505g.us.auth0.com`,
});
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (req, res) => {
    res.send('Ciao Mondo con Express e TypeScript!');
});
app.get('/history', checkJwt, (req, res) => {
    res.send('Questa è una rotta protetta perchè è la cronologia di chrome!');
});
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
