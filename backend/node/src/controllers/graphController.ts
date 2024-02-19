import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { addEdgesToGraph, createGraphQuery, findAllGraphs, findEdgesByGraphId, subtractTokensByEmail } from '../db/queries/graph_queries';
import { calculateCost, prepareGraphData, calculatePathUtility } from '../utils/graph_utils';
import Graph from "node-dijkstra";

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
{
  "name": "Mio Grafo23456",
  "description": "Descrizione del grafo con 16 nodi e connessioni multiple per testare percorsi ottimali e simulazioni.",
  "nodes": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  "edges": [
    {"startNode": "A", "endNode": "B", "weight": 1},
    {"startNode": "B", "endNode": "C", "weight": 2},
    {"startNode": "C", "endNode": "D", "weight": 1.5},
    {"startNode": "D", "endNode": "E", "weight": 2.5},
    {"startNode": "E", "endNode": "F", "weight": 2},
    {"startNode": "F", "endNode": "G", "weight": 1},
    {"startNode": "G", "endNode": "H", "weight": 2.5},
    {"startNode": "H", "endNode": "I", "weight": 1},
    {"startNode": "I", "endNode": "J", "weight": 1.5},
    {"startNode": "J", "endNode": "K", "weight": 2},
    {"startNode": "K", "endNode": "L", "weight": 1},
    {"startNode": "L", "endNode": "M", "weight": 2.5},
    {"startNode": "M", "endNode": "N", "weight": 2},
    {"startNode": "N", "endNode": "O", "weight": 1.5},
    {"startNode": "O", "endNode": "P", "weight": 2},
    {"startNode": "P", "endNode": "A", "weight": 2.5},
    {"startNode": "A", "endNode": "E", "weight": 2},
    {"startNode": "B", "endNode": "F", "weight": 1.5},
    {"startNode": "C", "endNode": "G", "weight": 2},
    {"startNode": "D", "endNode": "H", "weight": 1},
    {"startNode": "E", "endNode": "I", "weight": 2.5},
    {"startNode": "F", "endNode": "J", "weight": 2},
    {"startNode": "G", "endNode": "K", "weight": 1.5},
    {"startNode": "H", "endNode": "L", "weight": 2},
    {"startNode": "I", "endNode": "M", "weight": 1},
    {"startNode": "J", "endNode": "N", "weight": 2.5},
    {"startNode": "K", "endNode": "O", "weight": 2},
    {"startNode": "L", "endNode": "P", "weight": 1.5}
  ]
}
*/ 
export async function createGraph(req: Request, res: Response) {
    // Accede direttamente ai dati della richiesta tramite req.body
    const { name, description, nodes, edges } = req.body;
    
    let jwtUserEmail = getJwtEmail(req)
    
    // Cerca l'utente tramite email
    const user = await findUser(jwtUserEmail);
    const totalCost = calculateCost(nodes.length, edges.length);
    try {        
        // Crea il grafo //+ controlli nome/descrizione non possono esistere più nomi uguali
        const graph = await createGraphQuery(user[0].dataValues.user_id, name, description);
        for(let i=0; i<req.body.edges.length; i++){
            await addEdgesToGraph(graph.graph_id, edges[i].startNode, edges[i].endNode, edges[i].weight);
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.ImpossibileCreation);
    }
    finally{
        await subtractTokensByEmail(jwtUserEmail, totalCost)
    }
    statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelCreationSuccess);
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



export const CalculatePath = async (req: Request, res: Response) => {
    const { graphId, startNode, endNode } = req.body;

    try {
        const edges = await findEdgesByGraphId(graphId);
        const graphData = prepareGraphData(edges);

        const routeGraph = new Graph(graphData);
        const result = routeGraph.path(startNode, endNode, { cost: true });

        // Verifica che il risultato sia di tipo PathResult
        if (!Array.isArray(result) && result.path && result.cost !== undefined) {
            res.json({
                path: result.path,
                cost: result.cost,
                message: 'Path calculated successfully'
            });
        } else {
            return res.status(404).json({ message: 'Path not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating path' });
    }
};

interface PathResult {
    cost: number;
    configuration: number | null; // Assumo che configuration sia un numero, adattalo al tuo caso d'uso
    path: string[]; // Specifica che path è un array di stringhe
  }

  // Modifica della funzione simulateGraph per utilizzare calculatePathUtility
 // Modifica della funzione simulateGraph per utilizzare calculatePathUtility
export const simulateGraph = async (req: Request, res: Response) => {
    const { graphId, edgeId, startNode, endNode, startWeight, endWeight, step } = req.body;

    try {
        if (startWeight >= endWeight || step <= 0) {
            return res.status(400).json({ message: 'Invalid simulation parameters' });
        }

        const edges = await findEdgesByGraphId(graphId);
        if (!edges) {
            return res.status(404).json({ message: 'Edges not found' });
        }

        let results = [];
        let bestResult: PathResult = { cost: Infinity, configuration: null, path: [] };

        for (let weight = startWeight; weight <= endWeight; weight += step) {
            const simulatedEdges = edges.map((edge: any) => {
                if (edge.edge_id === edgeId) {
                    return { ...edge, weight };
                }
                return edge;
            });

            const graphData = prepareGraphData(simulatedEdges);
            const pathResult = calculatePathUtility(graphData, startNode, endNode);




            if (typeof pathResult === 'object' && 'cost' in pathResult) {
                results.push({ weight, cost: pathResult.cost, path: pathResult.path });

                if (pathResult.cost < bestResult.cost) {
                    bestResult = { cost: pathResult.cost, configuration: weight, path: pathResult.path };
                }
            }
        }

        res.json({ results, bestResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during simulation' });
    }
};


