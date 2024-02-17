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
// Trova lo storico delle richieste di aggiornamento per un utente specifico
export async function findRequestHistory(userId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            user_id: userId,
            approved: { [Op.ne]: null } // Seleziona le richieste che sono state approvate o rifiutate
        },
        include: [
            // Opzionale: includi qui altri modelli se necessario, ad esempio per dettagli sull'arco
        ],
        order: [['updatedAt', 'DESC']] // Ordina le richieste dal più recente al più vecchio
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

/**
 * Trova tutte le richieste di aggiornamento fatte ad un utente specifico nel database.
 * 
 * @param requesterId - L'ID dell'utente che ha fatto le richieste di aggiornamento.
 * @returns Una promessa che rappresenta l'elenco delle richieste di aggiornamento fatte dall'utente specificato.
 */
export async function findEdgeUpdatesByReceiver(receiverId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            receiver_id: receiverId
        }
    });
}


// Funzione per trovare le richieste di aggiornamento fatte dopo una certa data
export async function findUpdatesAfterDate(date: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            createdAt: {
                [Op.gt]: date // Filtra le righe con createdAt maggiore della data specificata
            }
        }
    });
}


// Funzione per trovare le richieste di aggiornamento fatte prima di una certa data
export async function findUpdatesBeforeDate(date: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            createdAt: {
                [Op.lt]: date // Filtra le righe con createdAt minore della data specificata
            }
        }
    });
}

// Funzione per trovare le richieste di aggiornamento fatte in un intervallo di date
export async function findUpdatesBetweenDates(startDate: Date, endDate: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate] // Filtra le righe con createdAt compreso tra startDate e endDate
            }
        }
    });
}

/**
 * Trova tutti gli aggiornamenti richiesti ad un utente specifico e filtrali per data.
 * 
 * @param userId - L'ID dell'utente per cui trovare gli aggiornamenti.
 * @param startDate - Data di inizio del filtro.
 * @param endDate - Data di fine del filtro.
 * @returns Una promessa che rappresenta l'elenco degli aggiornamenti richiesti per l'utente specificato, filtrati per data.
 */
export async function findUpdatesByUserAndDate(userId: number, startDate: Date, endDate: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            receiver_id: userId,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        }
    });
}

// Visualizza la cronologia delle modifiche di un arco
export async function findEdgeUpdateHistory(edgeId: number): Promise<any> {
    try {
        const updates = await UpdateModel.findAll({
            where: {
                edge_id: edgeId,
            },
            order: [
                ['createdAt', 'ASC'] // Ordina le modifiche dalla più vecchia alla più recente
            ],
            attributes: ['edge_id', 'requester_id', 'receiver_id', 'new_weight', 'approved', 'createdAt', 'updatedAt'],
            // Considera di includere join con altri modelli se necessario, per ottenere informazioni aggiuntive
        });

        // Controllo per assicurarsi che ci siano effettivamente aggiornamenti per l'arco
        if (updates.length === 0) {
            return { message: "Nessuna cronologia di aggiornamenti trovata per l'arco specificato." };
        }

        return updates;
    } catch (error) {
        console.error('Errore durante la ricerca della cronologia degli aggiornamenti dell\'arco:', error);
        throw new Error('Errore durante la ricerca della cronologia degli aggiornamenti');
    }
}


/**
 * Query per trovare tutti gli updates dato l'ID di un grafo
 */
export async function findPendingUpdatesByGraphId(graphId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            graph_id: graphId,
            approved: null
        } 
    });
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


