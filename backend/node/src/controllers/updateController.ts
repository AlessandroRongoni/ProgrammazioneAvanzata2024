import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { approveEdgeUpdate, filterUpdates, findPendingUpdatesByGraphId, findUpdateById, findUpdatesByReceiverInPending, rejectEdgeUpdate, requestEdgeUpdate } from '../db/queries/update_queries';
import { updateEdgeWeightInDB } from '../db/queries/update_queries';
import { findEdgeById, findGraphById, subtractTokensByEmail } from '../db/queries/graph_queries';
import { saveAndRespondWithFile } from '../utils/fileGenerationService';

const ALPHA = parseFloat(process.env.ALPHA || "0.8"); 
const update_cost_per_edge = parseFloat(process.env.UPDATE_COST_EDGES || "0.025");
/**
 * Updates the weight of an edge. (DA FINIRE)
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to void.
 */

/*
{
  "graphId": 1,
  "updates": [
    {
      "edgeId": 123,
      "newWeight": 5.5
    },
    {
      "edgeId": 124,
      "newWeight": 3.2
    },
    {
      "edgeId": 125,
      "newWeight": 7.1
    }
  ]
}
*/
export async function updateEdgeWeight(req: Request, res: Response) {
    //Vedo chi fa la richiesta
    const jwtUserEmail = getJwtEmail(req);
    const updates = req.body.updates;
    try {
        //trovo l'utente che fa la richiesta per usare il suo id
        const requester = await findUser(jwtUserEmail); // Trova l'utente che ha fatto la richiesta
        const graph = await findGraphById(req.body.graphId); // Trova il grafo dal database
        //verifico se l'utente che ha fatto la richiesta è il proprietario del grafo

        if (requester[0].dataValues.user_id === graph.user_id) {
            //se è il proprietario del grafo
            for (let i = 0; i < updates.length; i++) {
                
                const edge = await findEdgeById(req.body.updates[i].edgeId);
                const newWeight = req.body.updates[i].newWeight;
                const oldWeight = edge.weight;
                //calcolo il nuovo peso con la formula di aggiornamento
                const updatedWeight = ALPHA * oldWeight + (1 - ALPHA) * newWeight;
                //aggiorno il peso dell'arco nel db
                await updateEdgeWeightInDB(edge.edge_id, updatedWeight);
                //creo una row upgrade con richiedente e ricevitore lo stesso autore, da vedere se mettere il peso aggiornato o il peso nuovo richiesto
                const richiestaAggiornamento = await requestEdgeUpdate(graph.graph_id,edge.edge_id, requester[0].dataValues.user_id, graph.user_id, newWeight);
                //Visto che sono il creatore già approvo la modifica
                await approveEdgeUpdate(richiestaAggiornamento.update_id);
                
            }
            

        } else {
            //se non è il proprietario del grafo crea una richiesta in pending
            for (let i = 0; i < req.body.updates.length; i++) {
                
                const edge = await findEdgeById(req.body.updates[i].edgeId);
                const newWeight = req.body.updates[i].newWeight;
                // const oldWeight = edge[0].dataValues.weight; DA VEDERE QUALE PESO VUOLE IN UPDATE
                // const updatedWeight = ALPHA * oldWeight + (1 - ALPHA) * req.body.update[i].newWeight;
                await requestEdgeUpdate(graph.graph_id, edge.edge_id, requester[0].dataValues.user_id, graph.user_id, newWeight);
            }
            return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UpdateNotification);

        }
        
    } catch (error) {
        console.log("Sono nell'errore")

    }finally{
        const totalEdges = updates.length;
        const costoUpgrade = totalEdges * update_cost_per_edge;
        await subtractTokensByEmail(jwtUserEmail, costoUpgrade );
    }

    return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
};


/**
 * Retrieves and returns the pending updates for a user. DA RIVEDERE TUTTA
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the pending updates.
 */
export const viewPendingUpdatesForUser = async (req: Request, res: Response) => {
    try {
        let jwtUserEmail = getJwtEmail(req);
        const user = await findUser(jwtUserEmail);
        const pendingUpdates = await findUpdatesByReceiverInPending(user[0].dataValues.user_id);
        if (pendingUpdates.length === 0) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFound);

        }
        let message = JSON.parse(JSON.stringify({ pendingUpdates: pendingUpdates }));
        return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, message);

    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};
//daje

/**
 * Retrieves and returns the filtered update history for a user within a specified date range.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the filtered update history.
 */
export const viewFilteredUpdateHistory = async (req: Request, res: Response) => {
    const { graphId, dateFilter, status } = req.body;

    try {
        const startDate = dateFilter?.from ? new Date(dateFilter.from) : undefined;
        const endDate = dateFilter?.to ? new Date(dateFilter.to) : undefined;
        const updates = await filterUpdates(graphId, startDate, endDate, status);

                // Verifica se ci sono aggiornamenti
                if (updates.length === 0) {
                    // Restituisce un errore se non ci sono aggiornamenti
                    return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.NoUpdateForGraph);

                    
                }
                
        res.json(updates);
    } catch (error) {
        console.error("Error fetching filtered updates:", error);
        res.status(500).send("Error fetching filtered updates");
    }
};


/**
 * Retrieves and returns the pending updates for a model.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the pending updates.
 */
export const viewPendingUpdatesForModel = async (req: Request, res: Response) => {
    try {
        const graphId = req.body.graphId;
        const pendingUpdates = await findPendingUpdatesByGraphId(graphId);
        console.log(pendingUpdates);
        if (pendingUpdates.length === 0) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFoundForModel);

        }
        let message = JSON.parse(JSON.stringify({ pendingUpdates: pendingUpdates }));
        return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Rispondi alle richieste di update rifiutandole o accettandole a seconda di cosa viene preso sul body
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A status message indicating the result of the approval or rejection.
 * MODIFICARLO IN MODALITA' BULK e aggiornare i MIDDLWARE per il controllo multiplo
 */
export const answerUpdate = async (req: Request, res: Response) => {
    try {
        const { request } = req.body;
        for (let i = 0; i < request.length; i++) {
            const updateId = request[i].updateId;
            const answer = request[i].answer;
            const update = await findUpdateById(updateId);
            const edge = await findEdgeById(update.edge_id);
            const newWeight = update.new_weight;
            const oldWeight = edge.weight;
            if (answer) {
                const updatedWeight = ALPHA * oldWeight + (1 - ALPHA) * newWeight;
                await updateEdgeWeightInDB(update.edge_id, updatedWeight);
                await approveEdgeUpdate(updateId);
            } else {
                await rejectEdgeUpdate(updateId);
            }
        }
        return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, Messages200.RequestAwnsered);

    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Ottiene gli aggiornamenti nel formato specificato e li restituisce come risposta.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 * @returns La risposta HTTP con gli aggiornamenti nel formato specificato.
 */
export const getUpdatesInFormat = async (req: Request, res: Response) => {
    const { graphId, dateFilter: { from, to }, status, format } = req.body;
    const startDate = from ? new Date(from) : undefined;
    const endDate = to ? new Date(to) : undefined;
    try {
        const updates = await filterUpdates(graphId, startDate, endDate, status);
        const details = await findGraphById(graphId);
        await saveAndRespondWithFile(updates, format, res, details);
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.Unable);
    }
};
