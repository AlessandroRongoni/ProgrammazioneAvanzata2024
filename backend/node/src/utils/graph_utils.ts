import { Express } from "express";
import { MessageFactory } from "../status/messages_factory";
import Graph from "node-dijkstra";
import dotenv from "dotenv";
import { Messages400 } from "../status/status_codes";

dotenv.config();
const nodeCost = process.env.CREATE_COST_NODES ? parseFloat(process.env.CREATE_COST_NODES) : 0.10; // Costo per nodo, usato solo nella creazione
const edgeCost = process.env.CREATE_COST_EDGES ? parseFloat(process.env.CREATE_COST_EDGES) : 0.02; // Costo per arco, usato nella creazione


/**
 * Calcola il costo totale di un grafo dato il numero di nodi e il numero di archi.
 * 
 * @param nodes Il numero di nodi nel grafo.
 * @param edges Il numero di archi nel grafo.
 * @returns Il costo totale del grafo.
 */
export function calculateCost(nodes: number, edges: number): number {
    let totalCost = 0;
    totalCost += nodes * nodeCost + edges * edgeCost;
    return totalCost;
}


/**
 * Prepara i dati del grafo a partire dagli archi forniti.
 * 
 * @param edges - Gli archi del grafo.
 * @returns I dati del grafo preparati.
 */
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
 * Calcola il percorso più breve tra due nodi di un grafo.
 * 
 * @param graphData Dati del grafo.
 * @param startNode Nodo di partenza.
 * @param endNode Nodo di arrivo.
 * @returns Il percorso più breve e il suo costo, se esiste; altrimenti, undefined.
 */
export function calculatePathUtility(graphData: { [key: string]: { [key: string]: number } }, startNode: string, endNode: string) {
  const routeGraph = new Graph(graphData);
  return routeGraph.path(startNode, endNode, { cost: true });
}

/**
 * Restituisce un messaggio di errore per un formato non supportato.
 * 
 * @param format Il formato non supportato.
 * @param allowedFormats I formati supportati.
 * @returns Il messaggio di errore per un formato non supportato.
 */
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


/**
 * Restituisce un messaggio di errore per un formato non supportato.
 * 
 * @param format Il formato non supportato.
 * @param allowedFormats I formati supportati.
 * @returns Il messaggio di errore per un formato non supportato.
 */
export function validateEdgeErrorMessage(startNode: string, endNode: string, weight: number): string | null {
  if (!startNode || !endNode) {
      return "Sia il nodo di partenza che quello di arrivo devono essere specificati.";
  }
  if (startNode === endNode) {
      return "Il nodo di partenza e quello di arrivo non possono essere lo stesso.";
  }
  if (typeof weight !== 'number') {
    return "Il peso dell'arco deve essere un numero.";
}
  if (weight <= 0) {
      return "Il peso dell'arco deve essere un numero maggiore di zero.";
  }
  // Se tutti i controlli sono passati, l'arco è valido
  return null;
}


/**
 * Restituisce un messaggio di errore per un formato non supportato.
 * 
 * @param format Il formato non supportato.
 * @param allowedFormats I formati supportati.
 * @returns Il messaggio di errore per un formato non supportato.
 */
export function generateGraphNameInUseErrorMessage(graphName: string): string {
  return `Il nome del grafo '${graphName}' è già in uso.`;
}