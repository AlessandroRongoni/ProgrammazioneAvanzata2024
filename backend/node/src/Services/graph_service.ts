import { Request, Response } from "express";
import { EdgeModel } from "../models/EdgeModel"; // Assumi queste importazioni
import { GraphModel } from "../models/GraphModel"; // Assumi queste importazioni
import { UserModel } from "../models/UserModel"; // Assumi queste importazioni
import { UpdateModel } from "../models/UpdateModel"; // Assumi queste importazioni
import { findUser } from "../db/queries/user_queries";
import { findEdgeById, requestEdgeUpdate, updateEdgeWeightInDB, createGraphQuery, addEdgesToGraph } from "../db/queries/graph_queries";
import {approveEdgeUpdate, findUpdateByUserId} from '../db/queries/';

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

export async function createGraph(req: Request, res: Response) {
    try {
        // Creazione di un nuovo grafo
        const { name, description, nodes, edges } = req.body;
        const userId: any = await findUser(req.body.email);


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
        res.json({ message: "Grafo creato con successo", graph });
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
    }
}




export async function updateEdgeWeight(req: Request, res: Response) {
    const { edgeId, newWeight } = req.body;
    const requesterId: any = await findUser(req.body.email);

    try {
        // Trova l'arco dal database
        const edge = await findEdgeById(edgeId);
        if (!edge) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotFound);
        }

        // Verifica se l'utente è autorizzato a modificare questo arco
        const graph = await GraphModel.findByPk(edge.graphId);
        if (!graph) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNotFound);
        }

        if (graph.userId !== requesterId) {
            // L'utente non è il creatore del grafo, quindi invia una richiesta al creatore del grafo per l'aggiornamento
            const creatorId = graph.userId;
            await requestEdgeUpdate(edgeId, requesterId, creatorId, newWeight);
            return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
        }

        // Calcola il costo dell'aggiornamento
        const cost = calculateCost('update', { updatedEdges: 1 });

        // Verifica se l'utente ha abbastanza token per l'aggiornamento
        const user = await UserModel.findByPk(requesterId);
        if (!user || user.tokens < cost) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokens);
        }

        // Calcola il nuovo peso dell'arco utilizzando la media esponenziale
        const updatedWeight = ALPHA * edge.weight + (1 - ALPHA) * newWeight;

        // Aggiorna il peso dell'arco nel database
        await updateEdgeWeightInDB(edgeId, updatedWeight);

        // Deduce il costo dall'utente
        user.tokens -= cost;
        await user.save();

        // Rispondi con successo e i dettagli dell'aggiornamento
        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages500.InternalServerError);
    }
}
