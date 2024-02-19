import { Express } from "express";
import Graph = require("node-dijkstra")



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


export function prepareGraphData(edges: any) {
    const graphData: { [key: string]: { [key: string]: number } } = {};
  
    edges.forEach((edge: any) => {
      if (!graphData[edge.start_node]) {
        graphData[edge.start_node] = {};
      }
      graphData[edge.start_node][edge.end_node] = edge.weight;
    });
  
    return graphData;
  }


/**
 * Calcola il percorso più breve utilizzando i dati del grafo specificati e restituisce il risultato.
 * 
 * @param graphData Dati del grafo.
 * @param startNode Nodo di partenza.
 * @param endNode Nodo di arrivo.
 * @returns Il percorso più breve e il suo costo, se esiste; altrimenti, undefined.
 */
export async function calculatePathWithGraphData(graphData: { [key: string]: { [key: string]: number } }, startNode: string, endNode: string): Promise<{ path: string[]; cost: number } | undefined> {
  try {
      const routeGraph = new Graph(graphData);
      const result = routeGraph.path(startNode, endNode, { cost: true });

      if (result && !Array.isArray(result) && result.path && result.cost !== undefined) {
          return {
              path: result.path,
              cost: result.cost
          };
      } else {
          return undefined;
      }
  } catch (error) {
      console.error('Error calculating path with graph data:', error);
      return undefined;
  }
}

// Funzione di utilità per calcolare il percorso
export function calculatePathUtility(graphData: { [key: string]: { [key: string]: number } }, startNode: string, endNode: string) {
  const routeGraph = new Graph(graphData);
  return routeGraph.path(startNode, endNode, { cost: true });
}
