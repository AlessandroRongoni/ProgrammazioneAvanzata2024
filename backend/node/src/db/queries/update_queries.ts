// Importa la richiesta Express per gestire le richieste HTTP
import { Op } from 'sequelize';
// Importa il modello per gli archi
import { EdgeModel } from '../../models/EdgeModel';
// Importa il modello per gli aggiornamenti degli archi
import { UpdateModel } from '../../models/UpdateModel';
import { WhereOptions } from 'sequelize'; // Assicurati di importare WhereOptions da sequelize


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
};

/**
 * Respinge una richiesta di aggiornamento dell'arco nel database.
 * 
 * @param updateId - L'ID della richiesta di aggiornamento da respingere.
 * @returns Una promise che rappresenta l'esito dell'operazione di respingimento della richiesta di aggiornamento.
 */
export async function rejectEdgeUpdate(updateId: number): Promise<any> {
    return await UpdateModel.update({ approved: false }, {
        where: {
            update_id: updateId
        }
    });
};


/**
 * Trova tutte le richieste di aggiornamento fatte ad un utente specifico nel database.
 * 
 * @param requesterId - L'ID dell'utente che ha fatto le richieste di aggiornamento.
 * @param approved - Lo stato di approvazione della richiesta di aggiornamento.
 * @returns Una promise che rappresenta l'elenco delle richieste di aggiornamento fatte dall'utente specificato.
 */
export async function findUpdatesByReceiverInPending(receiverId: number): Promise<any> {
    return await UpdateModel.findAll({
        where: {
            receiver_id: receiverId,
            approved: null
        }
    });
};


/**
 * Filtra gli aggiornamenti in base ai criteri specificati.
 * 
 * @param graphId - L'ID del grafo per cui filtrare gli aggiornamenti.
 * @param startDate - La data di inizio per il filtro delle date (opzionale).
 * @param endDate - La data di fine per il filtro delle date (opzionale).
 * @param approved - Lo stato di approvazione per il filtro (opzionale).
 *                   Accetta i valori 'accepted', 'rejected' o undefined per includere tutti gli stati.
 * @returns Una Promise che risolve con un array di oggetti UpdateModel che corrispondono ai criteri di filtro.
 */
export async function filterUpdates(graphId: number, startDate?: Date, endDate?: Date, approved?: string) {
    // Inizializza la condizione WHERE per la query con l'ID del grafo.
    let whereCondition: WhereOptions = { //  WhereOptions permette una maggiore flessibilità
        graph_id: graphId,
    };

    // Aggiunge alla condizione WHERE i filtri basati sulle date, se specificati.
    if (startDate && endDate) {
        whereCondition['updatedat'] = { [Op.between]: [startDate, endDate] }; // Assicurati di usare 'createdAt' se è il nome corretto della colonna
    } else if (startDate) {
        whereCondition['updatedat'] = { [Op.gte]: startDate };
    } else if (endDate) {
        whereCondition['updatedat'] = { [Op.lte]: endDate };
    }

    // Gestisce il filtro per lo stato dell'approvazione
    if (approved !== undefined) {
        // Filtra gli aggiornamenti in base allo stato di approvazione: accettati, rifiutati o entrambi.
        whereCondition['approved'] = approved === 'accepted' ? true : approved === 'rejected' ? false : { [Op.or]: [true, false] };
    } else {
        // Esclude gli aggiornamenti con stato null, ovvero quelli in attesa di approvazione    
        whereCondition['approved'] = { [Op.or]: [true, false] };
    }

    // Esegue la query per trovare tutti gli aggiornamenti che corrispondono ai criteri specificati.
    return await UpdateModel.findAll({
        where: whereCondition
    });
}


/**
 * Trova gli aggiornamenti in sospeso per un determinato ID di grafo.
 * 
 * @param graphId - L'ID del grafo per cui cercare gli aggiornamenti in sospeso.
 * @returns Una Promise che si risolve con un array contenente gli aggiornamenti in sospeso.
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
 * @returns Una promise che rappresenta l'esito dell'operazione di creazione della richiesta di aggiornamento.
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


/**
 * Trova un aggiornamento dal suo ID.
 * @param updateId - L'ID dell'aggiornamento da cercare.
 * @returns Una promise che si risolve con l'aggiornamento trovato.
 */
export async function findUpdateById(updateId: number): Promise<any> {
    return await UpdateModel.findByPk(updateId);
}


