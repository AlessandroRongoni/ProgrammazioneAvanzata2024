// Importa il modello degli utenti
import { UserModel } from '../../models/UserModel';
// Importa il modello per i grafici
import { GraphModel } from '../../models/GraphModel';
// Importa il modello per gli archi
import { EdgeModel } from '../../models/EdgeModel';
// Importa il modello per gli aggiornamenti degli archi
import sequelize from "sequelize";


/**
 * Trova un grafico per ID.
 * @param graphId - L'ID del grafico da trovare.
 * @returns Una promise che si risolve con il grafico trovato.
 */
export async function findGraphById(graphId: number): Promise<any> {
    return await GraphModel.findByPk(graphId);
};


/**
 * Restituisce tutti i grafici presenti nel database.
 * @returns Una Promise che si risolve con un array contenente tutti i grafici.
 */
export async function findAllGraphs(): Promise<any> {
    return await GraphModel.findAll();
};



/**
 * Trova gli archi dato l'ID del grafo.
 * @param graphId - L'ID del grafo.
 * @returns Una Promise che si risolve con gli archi trovati.
 */
export async function findEdgesByGraphId(graphId: number): Promise<any> {
    return await EdgeModel.findAll({
        where: {
            graph_id: graphId
        }
    });
};

/**
 * Ricerca tutti i nodi unici associati a un dato graphId.
 * @param graphId L'identificativo del grafo per cui cercare i nodi.
 * @returns Una promise che si risolve con l'elenco dei nodi unici trovati.
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


/**
 * Trova un arco dato il suo ID.
 * @param edgeId - L'ID dell'arco da trovare.
 * @returns Una Promise che restituisce l'arco trovato.
 */
export async function findEdgeById(edgeId: number): Promise<any> {
    return await EdgeModel.findByPk(edgeId);
};


/**
 * Crea una nuova query per creare un grafo nel database.
 * 
 * @param userId - L'ID dell'utente che sta creando il grafo.
 * @param name - Il nome del grafo.
 * @param description - La descrizione del grafo.
 * @param cost - Il costo del grafo.
 * @returns Una promise che si risolve con il nuovo grafo creato.
 */
export async function createGraphQuery(userId: number, name: string, description: string, cost: number): Promise<any> {
    return await GraphModel.create({
        user_id: userId,
        name: name,
        description: description,
        cost: cost
    });
};

/**
 * Trova il costo di un grafo dato il suo ID.
 * @param graphId L'ID del grafo da cercare.
 * @returns Il costo del grafo se trovato, altrimenti null.
 * @throws Error se si verifica un errore durante la ricerca del costo del grafo.
 */
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
        console.error("Errore nel trovare il graph cost by graphId:", error);
        throw error; // Rilancia l'errore per una gestione ulteriore
    }
};

/**
 * Aggiunge un arco al grafo specificato.
 * 
 * @param graphId - L'ID del grafo a cui aggiungere l'arco.
 * @param startNode - Il nodo di partenza dell'arco.
 * @param endNode - Il nodo di arrivo dell'arco.
 * @param weight - Il peso dell'arco.
 * @returns Una promise che si risolve con il nuovo arco creato.
 */
export async function addEdgesToGraph(graphId: number, startNode: string, endNode: string, weight: number): Promise<any> {
        return EdgeModel.create({
            graph_id: graphId,
            start_node: startNode,
            end_node: endNode,
            weight: weight
        });

};


/**
 * Sottrae un numero specificato di token da un utente identificato tramite email.
 * @param email - L'email dell'utente da cui sottrarre i token.
 * @param tokens - Il numero di token da sottrarre.
 * @returns Una Promise che rappresenta l'esito dell'operazione di aggiornamento dei token dell'utente.
 */
export async function subtractTokensByEmail(email: string, tokens: number): Promise<any> {
    return await UserModel.update(
        { tokens: sequelize.literal(`tokens - ${tokens}`) },
        { where: { email: email } }
    );
};



/**
 * Trova un grafico per nome.
 * @param name Il nome del grafico da cercare.
 * @returns Una promise che si risolve con l'array dei grafici trovati.
 */
export async function findGraphByName(name: string): Promise<any> {
    return await GraphModel.findAll({
        where: {
            name: name
        }
    });
};
