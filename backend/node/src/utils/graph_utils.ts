import { Express } from "express";


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


