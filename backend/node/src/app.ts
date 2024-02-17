var express = require('express');
import { Request, Response } from "express";
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
import dotenv from 'dotenv';
import { checkEmail, checkPassword, checkPasswordMatch, checkTokensBody, checkUser, checkUserJwt, checkUserNotRegistered } from "./middleware/user_middleware"; // Import the missing checkEmail function
import { getUserTokens, login, createUser, getAllUsers } from './controllers/userController';
import { checkJwt } from "./middleware/jwt_middleware";
import { checkIsAdmin } from "./middleware/admin_middleware";
import { updateTokens } from "./controllers/adminController";
import { checkEdgeBelonging, checkGraphOwnership, checkUserTokensCreate, checkUserTokensUpdate, validateEdgeWeightsCreation, validateEdgeWeightsUpdate, checkGraphExistence} from "./middleware/graph_middleware";
import {getAllGraphs, getGraphEdges } from "./controllers/graphController";
import { updateEdgeWeight, viewPendingUpdatesForModel, viewPendingUpdatesForUser } from "./controllers/updateController";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST;


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
app.post("/login", jsonParser, checkEmail, checkPassword,checkUser, checkPasswordMatch, (req: Request, res: Response) => {
  login(req, res);
});

/**
 * Registra un nuovo utente
 */

app.post("/register", jsonParser, checkEmail, checkPassword,checkUserNotRegistered, (req: Request, res: Response) => {
  createUser(req, res);
});

/**
* Restituisce i token associati ad un utente
*/

app.get("/user/tokens", checkJwt,checkUserJwt, (req: Request, res: Response) => {
  getUserTokens(req, res);
});

/**
 * Modifica i token di un utente
 */

app.put('/recharge', jsonParser, checkIsAdmin, checkEmail, checkUser, checkTokensBody, (req: Request, res: Response) => {
  updateTokens(req, res);
});

/**
 * Rotta per la creazione di un grafo
 */
app.post("/graph", checkJwt, checkUserTokensCreate, (req: Request, res: Response) => {

});


/**
 * Rotta per ottenere tutta la lista dei grafi
 */
app.get("/graphslist", checkJwt, (req: Request, res: Response) => { 
    getAllGraphs(req,res);
  });


  /**
   * Rotta per ottenere la lista degli archi di un grafo
   */
app.get("/graph/edges", checkJwt,checkGraphExistence, (req: Request, res: Response) => {
    getGraphEdges(req,res);
  });

/**
 * Rotta per modificare i pesi di un arco di un determinato grafo (DA RIVEDERE)
 * 
 */
app.put("/graph/update/edge", jsonParser, checkJwt, checkEdgeBelonging, validateEdgeWeightsUpdate, checkUserTokensUpdate, checkGraphOwnership, (req: Request, res: Response) => {
  updateEdgeWeight(req,res);
});

/**
 * Rotta per ottenere tutti gli utenti
 * 
 */
app.get("/user/all",checkJwt,checkIsAdmin, (req: Request, res: Response) => {
  getAllUsers(req, res);
});

/** Rotta per visualizzare gli aggiornamenti pendenti per un modello
body:{
  *        "graphId": "1",
  * }
*/
app.get("/updates/graph/pending", checkJwt, checkGraphExistence, (req: Request, res: Response) => {
  viewPendingUpdatesForModel(req, res);
});




/** Rotta per visualizzare gli aggiornamenti pendenti per un utente

*/
app.get("/updates/user/pending", checkJwt, (req: Request, res: Response) => {
  viewPendingUpdatesForUser(req, res);
});








app.listen(port,host, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});

