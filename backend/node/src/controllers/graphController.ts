import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { createUserDb, findAllUsers, findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { addEdgesToGraph, createGraphQuery, findAllGraphs, findEdgeById, findEdgesByGraphId, findGraphById, subtractTokensByEmail } from '../db/queries/graph_queries';
import { calculateCost } from '../utils/graph_utils';
var jwt = require('jsonwebtoken');
var statusMessage: MessageFactory = new MessageFactory();


/*
{
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
        // Accede direttamente ai dati della richiesta tramite req.body
        const { name, description, nodes, edges } = req.body;

        let jwtUserEmail = getJwtEmail(req)

        // Cerca l'utente tramite email
        const user = await findUser(jwtUserEmail);

        // Calcola il costo per la creazione del grafo
        const cost =  await calculateCost('create', { nodes: nodes.length, edges: edges.length });
        // Deduce i token dall'utente
        console.log(cost)

        await subtractTokensByEmail(jwtUserEmail, cost)

        // Crea il grafo //+ controlli nome/descrizione non possono esistere più nomi uguali
        const graph = await createGraphQuery(user[0].dataValues.user_id, name, description);
        const id_newGraph = await findGraphById(graph.graph_id)
        console.log(graph.graph_id)

        for(let i=0; i<req.body.edges.lenght; i++){
        // Aggiungi gli archi al grafo
        console.log("e siamo dentro")
        await addEdgesToGraph(graph.graph_id, edges[i].startNode, edges[i].endNode, edges[i].weight);
        }
        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelCreationSuccess);
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.ImpossibileCreation);
    }
}



/**
 * Ottiene tutti i grafi.
 * Richiama il middleware getGraphslist per ottenere tutti i grafi registrati.
 */
export const getAllGraphs = async (req: Request,res: Response) => {
    try {
        const graphs = await findAllGraphs();
        let message = JSON.parse(JSON.stringify({ graphs: graphs }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Ottiene tutti gli archi di un grafo.
 * Richiama il middleware getGraphEdges per ottenere tutti gli archi di un grafo.
 * 
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 * 
 */
export const getGraphEdges = async (req: Request,res: Response) => {
    try {
        const graphId = req.body.graphId;
        const edges = await findEdgesByGraphId(graphId);
        let message = JSON.parse(JSON.stringify({ edges: edges }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

