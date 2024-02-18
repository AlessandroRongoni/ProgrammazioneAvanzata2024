// Importa la richiesta Express per gestire le richieste HTTP
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
export async function findUpdatesByRequester(requesterId: number): Promise<any> {
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
 * @param approved - Lo stato di approvazione della richiesta di aggiornamento.
 * @returns Una promessa che rappresenta l'elenco delle richieste di aggiornamento fatte dall'utente specificato.
 */
export async function findUpdatesByReceiverInPending(receiverId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            receiver_id: receiverId,
            approved: null
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
export async function findUpdatesByModelAndBetweenDate(graph_Id: number, startDate: Date, endDate: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            graph_Id: graph_Id,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        }
    });
}

// Filtra gli aggiornamenti per un modello specifico a partire da una data di inizio
export async function findUpdatesByModelAndStartDate(graph_Id: number, startDate: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            graph_Id: graph_Id,
            createdAt: {
                [Op.gte]: startDate
            }
        }
    });
}

// Filtra gli aggiornamenti per un modello specifico fino a una data di fine
export async function findUpdatesByModelAndEndDate(graph_Id: number, endDate: Date): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            graph_Id: graph_Id,
            createdAt: {
                [Op.lte]: endDate
            }
        }
    });
}


import { WhereOptions } from 'sequelize'; // Assicurati di importare WhereOptions da sequelize

// Funzione per filtrare gli aggiornamenti basandosi su varie condizioni
export async function filterUpdates(graphId: number, startDate?: Date, endDate?: Date, approved?: string) {
    let whereCondition: WhereOptions = { // Usa WhereOptions per una maggiore flessibilità
        graph_id: graphId,
    };

    // Gestisce il filtro per le date
    if (startDate && endDate) {
        whereCondition['createdat'] = { [Op.between]: [startDate, endDate] }; // Assicurati di usare 'createdAt' se è il nome corretto della colonna
    } else if (startDate) {
        whereCondition['createdat'] = { [Op.gte]: startDate };
    } else if (endDate) {
        whereCondition['createdat'] = { [Op.lte]: endDate };
    }

    // Gestisce il filtro per lo stato dell'approvazione
    if (approved !== undefined) {
        whereCondition['approved'] = approved === 'accepted' ? true : approved === 'rejected' ? false : { [Op.or]: [true, false] };
    } else {
        // Esclude gli aggiornamenti con stato null
        whereCondition['approved'] = { [Op.or]: [true, false] };
    }


    return await UpdateModel.findAll({
        where: whereCondition
    });
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
export async function requestEdgeUpdate(graphId:number, edgeId: number, requesterId: number, receiverId: number, newWeight: number): Promise<any> {
    return await UpdateModel.create({
        graph_id: graphId,
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
        const result = await EdgeModel.update({ weight: updatedWeight },
             { where:
                 { 
                    edge_id: edgeId
                 } 
            });
        console.log('Update result:', result);
        // Gestire qui eventuali risposte specifiche, come la verifica del numero di righe effettivamente aggiornate.
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del peso dell\'arco:', error);
        throw new Error('Errore durante l\'aggiornamento del peso dell\'arco');
    }
}

/** QUERY PER ottenere gli update dato l'ID
 * 
 * @param updateId - L'ID dell'aggiornamento da ottenere.
 * @returns Una promessa che rappresenta l'aggiornamento richiesto.
 * 
 */
export async function findUpdateById(updateId: number): Promise<any> {
    return await UpdateModel.findByPk(updateId);
}


