// Importa la richiesta Express per gestire le richieste HTTP
import { Request } from "express";
import { Op } from 'sequelize';
// Importa il modello degli utenti
import { UserModel } from '../../models/UserModel';
// Importa il modello per i grafici
import { GraphModel } from '../../models/GraphModel';
// Importa il modello per gli archi
import { EdgeModel } from '../../models/EdgeModel';
// Importa il modello per gli aggiornamenti degli archi
import { UpdateModel } from '../../models/UpdateModel';
import sequelize from "sequelize";




// Funzione per trovare un grafico nel database in base all'ID del grafico
export async function findGraphById(graphId: number): Promise<any> {
    return await GraphModel.findByPk(graphId);
}

// Funzione per trovare tutti i grafici creati da un utente specifico
export async function findGraphsByUserId(userId: number): Promise<any> {
    return await GraphModel.findAll({
        where: {
            user_id: userId,
        }
    });
}

// Funzione per trovare tutti i grafici presenti nel database
export async function findAllGraphs(): Promise<any> {
    return await GraphModel.findAll();
}



// Funzione per trovare tutti gli archi di un grafico specifico
export async function findEdgesByGraphId(graphId: number): Promise<any> {
    return await EdgeModel.findAll({
        where: {
            graph_id: graphId
        }
    });
}

/**
 * Ricerca tutti i nodi unici associati a un dato graphId.
 * @param graphId L'identificativo del grafo per cui cercare i nodi.
 * @returns Una promessa che si risolve con l'elenco dei nodi unici trovati.
 */
export const findNodesByGraphId = async (graphId: number): Promise<string[]> => {
    try {
      const edges = await EdgeModel.findAll({
        where: { graph_id: graphId },
        attributes: ['start_node', 'end_node'],
      });
  
      // Crea un set per evitare duplicati
      const nodesSet = new Set<string>();
  
      // Aggiungi sia i nodi di partenza che di arrivo al set
      edges.forEach((edge: any) => {
        nodesSet.add(edge.start_node);
        nodesSet.add(edge.end_node);
      });
  
      // Converti il set in un array e restituiscilo
      return Array.from(nodesSet);
    } catch (error) {
      console.error("Error fetching nodes by graphId:", error);
      throw error; // Rilancia l'errore per gestirlo ulteriormente o per segnalare il fallimento
    }
  };

// Funzione per trovare un arco specifico in base all'ID dell'arco
export async function findEdgeById(edgeId: number): Promise<any> {
    return await EdgeModel.findByPk(edgeId);
}


export async function createGraphQuery(userId: number, name: string, description: string, cost: number): Promise<any> {
    return await GraphModel.create({
        user_id: userId,
        name: name,
        description: description,
        cost: cost
    });
}

export async function findGraphCostById(graphId: number): Promise<number | null> {
    try {
        const graph = await GraphModel.findByPk(graphId, {
            attributes: ['cost'] // Seleziona solo la colonna 'cost'
        });
        if (graph) {
            return graph.cost; // Restituisce il costo se il grafo è stato trovato
        } else {
            return null; // Restituisce null se non viene trovato nessun grafo con l'ID specificato
        }
    } catch (error) {
        console.error("Error fetching graph cost by graphId:", error);
        throw error; // Rilancia l'errore per una gestione ulteriore
    }
}

export async function addEdgesToGraph(graphId: number, startNode: string, endNode: string, weight: number): Promise<any> {
        return EdgeModel.create({
            graph_id: graphId,
            start_node: startNode,
            end_node: endNode,
            weight: weight
        });

}

//Query per sottrarre tokens all'utente per email
export async function subtractTokensByEmail(email: string, tokens: number): Promise<any> {
    return await UserModel.update(
        { tokens: sequelize.literal(`tokens - ${tokens}`) },
        { where: { email: email } }
    );
}

//Query per cercare un grafo in base al nome
export async function findGraphByName(name: string): Promise<any> {
    return await GraphModel.findAll({
        where: {
            name: name
        }
    });
}

//QUery per contare il numero di archi di un grafo
export async function countEdgesByGraphId(graphId: number): Promise<any> {
    return await EdgeModel.count({
        where: {
            graph_id: graphId
        }
    });
}