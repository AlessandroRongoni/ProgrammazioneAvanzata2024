import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { createUserDb, findAllUsers, findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { approveEdgeUpdate, findEdgeUpdatesByReceiver, findUpdatesByUserAndDate, rejectEdgeUpdate } from '../db/queries/update_queries';
import { findAllGraphs, findEdgeById, findEdgesByGraphId } from '../db/queries/graph_queries';
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
    
};



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

