import { findGraphById, findEdgeById, updateEdgeWeightInDB } from "../db/queries/graph_queries";
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { Response, Request } from "express";
import dotenv from 'dotenv';
dotenv.config();

let statusMessage: MessageFactory = new MessageFactory();
const ALPHA = parseFloat(process.env.ALPHA || "0.8"); 

export function calculateCost(action: 'create' | 'update', details: { nodes?: number, edges?: number, updatedEdges?: number }): number {
    const nodeCost = 0.10; // Costo per nodo, usato solo nella creazione
    const edgeCost = 0.02; // Costo per arco, usato nella creazione
    const updateCostPerEdge = 0.025; // Costo per aggiornare un arco

    let totalCost = 0;

    if (action === 'create') {
        // Calcolo costo per la creazione di un grafo
        totalCost += (details.nodes || 0) * nodeCost + (details.edges || 0) * edgeCost;
    } else if (action === 'update') {
        // Calcolo costo per l'aggiornamento dei pesi degli archi
        totalCost += (details.updatedEdges || 0) * updateCostPerEdge;
    }

    return totalCost;
}



/**
 * Analizza una stringa JSON e la formatta per l'inserimento nel database.
 * Esegue la validazione e la trasformazione in base a regole predefinite.
 * 
 * @param {string} jsonString La stringa JSON da analizzare.
 * @returns {object} L'oggetto formattato e validato pronto per l'inserimento nel DB.
 * @throws {Error} Se il JSON è invalido o non soddisfa i criteri di validazione.
 */
export function formatJsonForDb(jsonString: string) {
    const obj = JSON.parse(jsonString);

    // Esempio di validazione e trasformazione
    if (!obj.campoRichiesto) {
        throw new Error('Campo richiesto mancante');
    }

    // Trasforma i dati secondo le necessità per il DB
    const transformedObj = {
        ...obj,
        campoTrasformato: transformData(obj.alcunCampo)
    };

    return transformedObj;
}

function transformData(data: any) {
    // Placeholder per la logica effettiva di trasformazione dei dati
    return data;
}

/*
{   "graphId": 1,
    "edgeId": 123,
    "newWeight": 5.5
  }
*/
export async function updateEdgeWeightService(req: Request, res: Response) {
    try {
        // Trova l'arco dal database
        const edge = await findEdgeById(req.body.edgeId);
        if (!edge) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.EdgeNotFound);
        }
        // Calcola il nuovo peso dell'arco utilizzando la media esponenziale
        const updatedWeight = ALPHA * edge.weight + (1 - ALPHA) * req.body.newWeight;

        // Aggiorna il peso dell'arco nel database
        await updateEdgeWeightInDB(edge.id, updatedWeight);
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
        await edge.save();
        // Rispondi con successo e i dettagli dell'aggiornamento
    } catch (error) {
        console.error(error);
    }
}
