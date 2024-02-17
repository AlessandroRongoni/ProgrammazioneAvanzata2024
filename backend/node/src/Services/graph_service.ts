import { Request, Response } from "express";
import { EdgeModel } from "../models/EdgeModel"; // Assumi queste importazioni
import { GraphModel } from "../models/GraphModel"; // Assumi queste importazioni
import { UserModel } from "../models/UserModel"; // Assumi queste importazioni
import { UpdateModel } from "../models/UpdateModel"; // Assumi queste importazioni
import { findUser } from "../db/queries/user_queries";
import { findEdgeById, requestEdgeUpdate, updateEdgeWeightInDB, createGraphQuery, addEdgesToGraph, approveEdgeUpdate, findUpdatesByUserId } from "../db/queries/graph_queries";
import { checkIsAdmin } from "../middleware/admin_middleware"; // Middleware di autenticazione
import { checkJwt } from "../middleware/jwt_middleware"; // Middleware di autenticazione
import { calculateCost } from "../utils/graph_utils"; 
import { CustomStatusCodes, Messages400, Messages200, Messages500 } from '../status/status_codes';
import { MessageFactory } from '../status/messages_factory';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();
var statusMessage: MessageFactory = new MessageFactory();


const ALPHA = parseFloat(process.env.ALPHA || "0.8"); // Assicurati che ALPHA sia un numero

/*
{
  "email": "utente@example.com",
  "name": "Mio Grafo",
  "description": "Descrizione del grafo",
  "nodes": ["A", "B", "C"],
  "edges": [
    {"start": "A", "end": "B", "weight": 5},
    {"start": "B", "end": "C", "weight": 3}
  ]
}
*/ 

export async function createGraph(req: Request, res: Response) {
    try {
        // Creazione di un nuovo grafo
        const formattedData = formatJsonForDb(req.body);
        const { name, description, nodes, edges } = formattedData;
        const userId: any = await findUser(formattedData.email);


        // Calcola il costo per la creazione del grafo
        // Assicurati che la funzione calculateCost sia definita per accettare un oggetto con proprietà nodes ed edges
        // Dove nodes ed edges sono rispettivamente il numero di nodi e di archi del grafo
        const cost = calculateCost('create', { nodes: nodes.length, edges: edges.length });

        // Verifica i token dell'utente
        const user = await UserModel.findByPk(userId);
        if (!user || user.tokens < cost) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokens);
        }

        // Deduce i token dall'utente in base al costo calcolato
        user.tokens -= cost;
        await user.save();

        // Crea grafo
        const graph = await createGraphQuery(userId, name, description); // Attendi il risultato

        // Aggiungi gli archi al grafo
        await addEdgesToGraph(graph.id, edges);

        // Restituisce la risposta con il successo della creazione del grafo
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelCreationSuccess);
    }
}


