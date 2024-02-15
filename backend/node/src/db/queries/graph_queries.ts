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
            graph_id: graphId,
        }
    });
}

// Funzione per trovare un arco specifico in base all'ID dell'arco
export async function findEdgeById(edgeId: number): Promise<any> {
    return await EdgeModel.findByPk(edgeId);
}



// Funzione per trovare tutti gli aggiornamenti degli archi per un determinato utente
export async function findUpdatesByUserId(userId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            user_id: userId,
        }
    });
}

// Funzione per trovare tutti gli aggiornamenti degli archi per un determinato arco
export async function findUpdatesByEdgeId(edgeId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            edge_id: edgeId,
        }
    });
}


export async function createGraph(userId: number, name: string, description: string): Promise<any> {
    return await GraphModel.create({
        user_id: userId,
        name: name,
        description: description
    });
}


export async function addEdgesToGraph(graphId: number, edges: { startNode: string, endNode: string, weight: number }[]): Promise<any> {
    const edgePromises = edges.map(edge => {
        return EdgeModel.create({
            graph_id: graphId,
            start_node: edge.startNode,
            end_node: edge.endNode,
            weight: edge.weight
        });
    });
    return await Promise.all(edgePromises);
}



/**
 * Crea una nuova richiesta di aggiornamento per un arco nel database.
 * 
 * @param edgeId - L'ID dell'arco da aggiornare.
 * @param requesterId - L'ID dell'utente che richiede l'aggiornamento.
 * @param receiverId - L'ID dell'utente a cui è destinata la richiesta di aggiornamento.
 * @param newWeight - Il nuovo peso da assegnare all'arco.
 * @returns Una promessa che rappresenta l'esito dell'operazione di creazione della richiesta di aggiornamento.
 */
export async function requestEdgeUpdate(edgeId: number, requesterId: number, receiverId: number, newWeight: number): Promise<any> {
    return await UpdateModel.create({
        edge_id: edgeId,
        requester_id: requesterId,
        receiver_id: receiverId,
        new_weight: newWeight
    });
}

/**
 * Approva una richiesta di aggiornamento dell'arco nel database.
 * 
 * @param updateId - L'ID della richiesta di aggiornamento da approvare.
 * @returns Una promessa che rappresenta l'esito dell'operazione di approvazione della richiesta di aggiornamento.
 */
export async function approveEdgeUpdate(updateId: number): Promise<any> {
    return await UpdateModel.update({ approved: true }, {
        where: {
            update_id: updateId
        }
    });
}

/**
 * Respinti una richiesta di aggiornamento dell'arco nel database.
 * 
 * @param updateId - L'ID della richiesta di aggiornamento da respingere.
 * @returns Una promessa che rappresenta l'esito dell'operazione di respingimento della richiesta di aggiornamento.
 */
export async function rejectEdgeUpdate(updateId: number): Promise<any> {
    return await UpdateModel.update({ approved: false }, {
        where: {
            update_id: updateId
        }
    });
}

/**
 * Trova tutte le richieste di aggiornamento pendenti per un utente specifico nel database.
 * 
 * @param userId - L'ID dell'utente per cui trovare le richieste di aggiornamento pendenti.
 * @returns Una promessa che rappresenta l'elenco delle richieste di aggiornamento pendenti per l'utente specificato.
 */
export async function findPendingRequests(userId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            user_id: userId,
            approved: null // Solo le richieste pendenti
        },
        include: [
            { model: EdgeModel } // Include i dettagli dell'arco associato alla richiesta
        ]
    });
}

/**
 * Trova tutte le richieste di aggiornamento NON pendenti per un utente specifico nel database.
 * 
 * @param userId - L'ID dell'utente per cui trovare le richieste di aggiornamento pendenti.
 * @returns Una promessa che rappresenta l'elenco delle richieste di aggiornamento true e false per l'utente specificato.
 */
export async function findRequestHistory(userId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            user_id: userId,
            approved: { [Op.not]: null } // Tutte le richieste tranne quelle pendenti
        },
        include: [
            { model: EdgeModel } // Include i dettagli dell'arco associato alla richiesta
        ]
    });
}

/**
 * Trova tutte le richieste di aggiornamento fatte da un utente specifico nel database.
 * 
 * @param requesterId - L'ID dell'utente che ha fatto le richieste di aggiornamento.
 * @returns Una promessa che rappresenta l'elenco delle richieste di aggiornamento fatte dall'utente specificato.
 */
export async function findEdgeUpdatesByRequester(requesterId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            requester_id: requesterId
        }
    });
}
