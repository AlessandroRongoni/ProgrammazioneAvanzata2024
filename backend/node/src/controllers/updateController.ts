import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { createUserDb, findAllUsers, findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { approveEdgeUpdate, findPendingUpdatesByGraphId, findUpdatesByEdgeId, findUpdatesByReceiverInPending, findUpdatesByUserAndDate, rejectEdgeUpdate, requestEdgeUpdate } from '../db/queries/update_queries';
import { updateEdgeWeightInDB } from '../db/queries/update_queries';
import { findEdgeById, findGraphById } from '../db/queries/graph_queries';
import { stat } from 'fs';
var jwt = require('jsonwebtoken');
var statusMessage: MessageFactory = new MessageFactory();
const ALPHA = parseFloat(process.env.ALPHA || "0.8"); 
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
    try {
        //Vedo chi fa la richiesta
        const jwtUserEmail = getJwtEmail(req);
        //trovo l'utente che fa la richiesta per usare il suo id
        const requester = await findUser(jwtUserEmail); // Trova l'utente che ha fatto la richiesta
        const graph = await findGraphById(req.body.graphId); // Trova il grafo dal database
        //verifico se l'utente che ha fatto la richiesta è il proprietario del grafo
        if (requester[0].dataValues.user_id === graph.user_id) {
            //se è il proprietario del grafo
            for (let i = 0; i < req.body.updates.length; i++) {
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
            console.log("Sono dopo il for")
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
        } else {
            //se non è il proprietario del grafo crea una richiesta in pending
            for (let i = 0; i < req.body.updates.length; i++) {
                const edge = await findEdgeById(req.body.updates[i].edgeId);
                const newWeight = req.body.updates[i].newWeight;
                // const oldWeight = edge[0].dataValues.weight; DA VEDERE QUALE PESO VUOLE IN UPDATE
                // const updatedWeight = ALPHA * oldWeight + (1 - ALPHA) * req.body.update[i].newWeight;
                await requestEdgeUpdate(graph.graph_id, edge.edge_id, requester[0].dataValues.user_id, graph.user_id, newWeight);
                statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UpdateNotification);
            }
        }
        
    } catch (error) {
        console.log("Sono nell'errore")
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
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
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFound);
        }
        let message = JSON.parse(JSON.stringify({ pendingUpdates: pendingUpdates }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Retrieves and returns the filtered update history for a user within a specified date range.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the filtered update history.
 */
export const viewFilteredUpdateHistory = async (req: Request, res: Response) => {
    const userId: any = await findUser(req.body.email);
    const { startDate, endDate } = req.query;

    try {
        if (!startDate || !endDate) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoDate);
        }

        // Converte le stringhe delle date in oggetti Date
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
/*
        // Controlla la validità delle date
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);
        }

        // Verifica che la data di inizio non coincida con quella di fine
        if (start.getTime() === end.getTime()) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDateSame);
        }

        // Verifica che la data di inizio preceda quella di fine
        if (start > end) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);
        }
*/
        const updateHistory = await findUpdatesByUserAndDate(userId, start, end);
/*
        if (updateHistory.length === 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.NoStoric);
        }*/

        res.status(200).json(updateHistory);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFoundForModel);
        }
        let message = JSON.parse(JSON.stringify({ pendingUpdates: pendingUpdates }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
        const { updateId, answer } = req.body;
        const result = await findUpdatesByEdgeId(updateId);
        if (answer) {
            await approveEdgeUpdate(updateId);
            return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.WeightUpdateApprovalSuccess);
        } else {
            await rejectEdgeUpdate(updateId);
            return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.WeightUpdateRejectionSuccess);
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }

};