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
import { checkUserTokensCreate, checkUserTokensUpdate, checkGraphExistence, checkAllEdgesBelongingAndCorrectWeights, checkUpdatesExistence, checkOwnerGraphs, checkUpdatesArePending, checkUpdatesAreDifferent, validateGraphStructure} from "./middleware/graph_middleware";
import {createGraph, getAllGraphs, getGraphEdges, CalculatePath } from "./controllers/graphController";
import { answerUpdate, getUpdatesInFormat, updateEdgeWeight, viewFilteredUpdateHistory, viewPendingUpdatesForModel, viewPendingUpdatesForUser } from "./controllers/updateController";
import { calculateCost } from "./utils/graph_utils";
import Graph = require("node-dijkstra")


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
 * MIGLIROAMENTO DEI MIDDLE E NON FUNZIONA BENE
 * 
{
  "name": "Mio Grafo",
  "description": "Descrizione del grafo",
  "nodes": ["A", "B", "C"],
  "edges": [
    {"startNode": "A", "endNode": "B", "weight": 5},
    {"startNode": "B", "endNode": "C", "weight": 3}
  ]
}
 */
app.post("/graph", jsonParser, checkJwt, validateGraphStructure, checkUserTokensCreate, (req: Request, res: Response) => {
  createGraph(req,res);
});

app.post("/graph/calculatecost", jsonParser, checkJwt, (req: Request, res: Response) =>{
  CalculatePath(req,res);
})



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
 * Rotta per ottenere tutti gli utenti
 * 
 */
app.get("/user/all",checkJwt,checkIsAdmin, (req: Request, res: Response) => {
  getAllUsers(req, res);
});

/** 
 * Rotta per visualizzare gli aggiornamenti pendenti per un modello
body:{
  *        "graphId": "1",
  * }
*/
app.get("/updates/graph/pending", checkJwt, checkGraphExistence, (req: Request, res: Response) => {
  viewPendingUpdatesForModel(req, res);
});


/** 
 * Rotta per visualizzare gli aggiornamenti pendenti per un utente
*/
app.get("/updates/user/pending", checkJwt,(req: Request, res: Response) => {
  viewPendingUpdatesForUser(req, res);
});


// Rotte per approvare o rifiutare una richiesta di aggiornamento
/**
 * body:{
 *      "request":[
 *          {
 *            "updateId": "1",
 *            "answer": true/false
 *          },
 *           {
 *            "updateId": "2",
 *            "answer": true/false
 *          },
 *        ]
 * }
  */
app.put("/update/answer", jsonParser, checkJwt,checkUpdatesExistence, checkOwnerGraphs, checkUpdatesArePending,checkUpdatesAreDifferent, (req: Request, res: Response) => {
  answerUpdate(req,res);
});

/**
 * Rotta per aggiornare uno o più archi di un grafo
 * {
  "graphId": 1,
  "updates": [
    {
      "edgeId": 123,
      "newWeight": 5.5
    },
    {
      "edgeId": 124,
      "newWeight": 3.2
    }
  ]
}
 */       
app.put("/update/edges", jsonParser, checkJwt, checkGraphExistence, checkAllEdgesBelongingAndCorrectWeights,checkUserTokensUpdate, (req: Request, res: Response) => {
  updateEdgeWeight(req,res);
});

/** 
 * Rotta che dato un modello consenta di restituire l’elenco degli 
 * aggiornamenti effettuati nel corso del tempo filtrando opzionalmente per 
 * data (inferiore a, superiore a, compresa tra) distinguendo 
 * per stato ovvero accettato / rigettato 
 * {
  "graphId": 1,
  "dateFilter": {
    "from": "2023-01-01",
    "to": "2023-12-31"
  },
  "status": "accepted" // Valori possibili: "accepted", "rejected", o lasciare vuoto/null per non filtrare per stato
  }

  DEVO CREARE I MIDDLEWARE PER IL FILTRO DEL HISTORY
*/
app.get("/updates/history/graph", checkJwt, (req: Request, res: Response) => {
  viewFilteredUpdateHistory(req,res);
});

app.get("/updates/format", checkJwt, (req: Request, res: Response) => {
  getUpdatesInFormat(req,res);
});

app.listen(port,host, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
function calculatePath(req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) {
  throw new Error("Function not implemented.");
}

