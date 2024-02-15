import { findGraphById, findEdgeById } from "../db/queries/graph_queries";
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages400 } from '../status/status_codes';
import { GraphData } from "./graphTypes";
import { Response } from "express";

let statusMessage: MessageFactory = new MessageFactory();

/**
 * Verifica che un arco specificato esista nel grafo e che il nuovo peso sia valido.
 * @param graphId - ID del grafo.
 * @param edgeId - ID dell'arco da aggiornare.
 * @param newWeight - Il nuovo peso proposto per l'arco.
 * @param res - L'oggetto di risposta HTTP utilizzato per inviare la risposta al client.
 * @returns Una Promise che restituisce true se l'arco esiste e il nuovo peso è valido, altrimenti false.
 */
export async function verifyGraphEdgeUpdate(graphId: number, edgeId: number, newWeight: number, res: Response) {
    let isUpdateValid = true;

    // Cerca il grafo per ID per verificare la sua esistenza
    const graph = await findGraphById(graphId);
    if (!graph) {
        // Se il grafo non esiste, invia un messaggio di errore e imposta isUpdateValid su false
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNotFound);
        isUpdateValid = false;
        return isUpdateValid;
    }

    // Cerca l'arco per ID e verifica che appartenga al grafo corretto
    const edge = await findEdgeById(edgeId);
    if (!edge || edge.graphId !== graphId) {
        // Se l'arco non esiste o non appartiene al grafo, invia un messaggio di errore e imposta isUpdateValid su false
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
        isUpdateValid = false;
        return isUpdateValid;
    }

    // Verifica che il nuovo peso proposto sia un numero non negativo
    if (typeof newWeight !== 'number' || newWeight < 0) {
        // Se il nuovo peso non è valido, invia un messaggio di errore e imposta isUpdateValid su false
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
        isUpdateValid = false;
    }

    // Restituisce true se tutti i controlli sono superati, indicando che l'aggiornamento è valido
    return isUpdateValid;
}


/**
 * Valida la struttura di un grafo durante la creazione.
 * @param graphData - Dati del grafo da validare, seguendo l'interfaccia GraphData.
 * @param res - Oggetto di risposta HTTP per comunicare con il client.
 * @returns {boolean} - Restituisce true se la struttura del grafo è valida, altrimenti false.
 */
function isValidGraphCreation(graphData: GraphData, res: Response): boolean {
    // Verifica l'esistenza, il tipo e la non-vuotezza dell'array dei nodi
    if (!graphData.nodes || !Array.isArray(graphData.nodes) || graphData.nodes.length === 0) {
        // Invia un messaggio di errore se i nodi non sono validi
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
        return false; // Termina la funzione indicando che la validazione è fallita
    }
    // Verifica l'esistenza e il tipo dell'array degli archi
    if (!graphData.edges || !Array.isArray(graphData.edges)) {
        // Invia un messaggio di errore se gli archi non sono validi
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
        return false; // Termina la funzione indicando che la validazione è fallita
    }

    // Controlla che ogni arco abbia sorgente, destinazione validi e peso non negativo
    const hasValidEdges = graphData.edges.every(edge => 
        edge.source && edge.target && typeof edge.weight === 'number' && edge.weight >= 0);
    if (!hasValidEdges) {
        // Invia un messaggio di errore se almeno un arco non è valido
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
        return false; // Termina la funzione indicando che la validazione è fallita
    }

    return true; // Restituisce true se tutti i controlli sono superati
}

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
