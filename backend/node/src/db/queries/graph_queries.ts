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
            graph_id: graphId,
        }
    });
}

// Funzione per trovare un arco specifico in base all'ID dell'arco
export async function findEdgeById(edgeId: number): Promise<any> {
    return await EdgeModel.findByPk(edgeId);
}



export async function createGraphQuery(userId: number, name: string, description: string): Promise<any> {
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
 * Aggiorna il peso di un arco specificato nel database.
 * 
 * @param edgeId ID dell'arco da aggiornare.
 * @param updatedWeight Nuovo peso da assegnare all'arco.
 */
export async function updateEdgeWeightInDB(edgeId: number, updatedWeight: number): Promise<void> {
    try {
        const result = await EdgeModel.update({ weight: updatedWeight }, { where: { edge_id: edgeId } });
        console.log('Update result:', result);
        // Gestire qui eventuali risposte specifiche, come la verifica del numero di righe effettivamente aggiornate.
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del peso dell\'arco:', error);
        throw new Error('Errore durante l\'aggiornamento del peso dell\'arco');
    }
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

// Funzione per trovare tutti gli aggiornamenti degli archi per un determinato utente
export async function findUpdatesByUserId(userId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            user_id: userId,
        }
    });
}


//Query per sottrarre tokens all'utente per email
export async function subtractTokensByEmail(email: string, tokens: number): Promise<any> {
    return await UserModel.update(
        { tokens: sequelize.literal(`tokens - ${tokens}`) },
        { where: { email: email } }
    );
}