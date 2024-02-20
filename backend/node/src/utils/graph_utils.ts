import { Express } from "express";
import { MessageFactory } from "../status/messages_factory";
import Graph from "node-dijkstra";
import dotenv from "dotenv";
import { Messages400 } from "../status/status_codes";

dotenv.config();
const nodeCost = process.env.CREATE_COST_NODES ? parseFloat(process.env.CREATE_COST_NODES) : 0.10; // Costo per nodo, usato solo nella creazione
const edgeCost = process.env.CREATE_COST_EDGES ? parseFloat(process.env.CREATE_COST_EDGES) : 0.02; // Costo per arco, usato nella creazione


export function calculateCost(nodes: number, edges: number): number {
    let totalCost = 0;
    totalCost += nodes * nodeCost + edges * edgeCost;
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

export function getUnsupportedFormatMessage(format: string, allowedFormats: string[]): string {
  return Messages400.UnsupportedFormat.replace('{{format}}', format).replace('{{allowedFormats}}', allowedFormats.join(', '));
}

// Funzione helper per generare messaggi di errore personalizzati per nodi non definiti
export function generateUndefinedNodesErrorMessage(startNode: string, endNode: string, nodeSet: Set<string>): string {
  let errorMessage = "L'arco contiene nodi non definiti: ";
  const undefinedNodes = [];
  
  if (!nodeSet.has(startNode)) {
      undefinedNodes.push(`'${startNode}'`);
  }
  if (!nodeSet.has(endNode)) {
      undefinedNodes.push(`'${endNode}'`);
  }
  
  errorMessage += undefinedNodes.join(" e ") + " non sono presenti nell'elenco dei nodi.";
  return errorMessage;
}

export function validateEdgeErrorMessage(startNode: string, endNode: string, weight: number): string | null {
  if (!startNode || !endNode) {
      return "Sia il nodo di partenza che quello di arrivo devono essere specificati.";
  }
  if (startNode === endNode) {
      return "Il nodo di partenza e quello di arrivo non possono essere lo stesso.";
  }
  if (typeof weight !== 'number' || weight <= 0) {
      return "Il peso dell'arco deve essere un numero maggiore di zero.";
  }
  // Se tutti i controlli sono passati, l'arco è valido
  return null;
}

// Funzione helper per generare un messaggio di errore per nomi di grafi già in uso
export function generateGraphNameInUseErrorMessage(graphName: string): string {
  return `Il nome del grafo '${graphName}' è già in uso.`;
}