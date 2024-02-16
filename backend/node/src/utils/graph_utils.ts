import { findGraphById, findEdgeById } from "../db/queries/graph_queries";
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages400 } from '../status/status_codes';
import { GraphData } from "./graphTypes";
import { Response } from "express";

let statusMessage: MessageFactory = new MessageFactory();


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

