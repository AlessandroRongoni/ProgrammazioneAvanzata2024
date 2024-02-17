import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { createUserDb, findAllUsers, findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
import { approveEdgeUpdate, findEdgeUpdatesByReceiver, findPendingUpdatesByGraphId, findUpdatesByEdgeId, findUpdatesByUserAndDate, rejectEdgeUpdate } from '../db/queries/update_queries';
import { updateEdgeWeightInDB } from '../db/queries/update_queries';
import { findEdgeById } from '../db/queries/graph_queries';
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
{   "graphId": 1,
    "edgeId": 123,
    "newWeight": 5.5
  }
*/
export async function updateEdgeWeight(req: Request, res: Response) {
    try {
        // Trova l'arco dal database
        const edge = await findEdgeById(req.body.edgeId);
        // Calcola il nuovo peso dell'arco utilizzando la media esponenziale
        const updatedWeight = ALPHA * edge.weight + (1 - ALPHA) * req.body.newWeight;
        // Aggiorna il peso dell'arco nel database
        await updateEdgeWeightInDB(edge.id, updatedWeight);
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.ModelUpdateSuccess);
        await edge.save();
        // Rispondi con successo e i dettagli dell'aggiornamento
    } catch (error) {
        console.error(error);
    }
}


/**
 * Retrieves and returns the pending updates for a user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the pending updates.
 */
export const viewPendingUpdatesForUser = async (req: Request, res: Response) => {
    try {
        const receiverId: any = await findUser(req.body.email);
        const pendingUpdates = await findEdgeUpdatesByReceiver(receiverId);

       /* if (pendingUpdates.length === 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFound);
        }*/

        res.status(200).json(pendingUpdates);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Approves an update request.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A status message indicating the result of the approval.
 */
export const approveUpdate = async (req: Request, res: Response) => {
    try {
        const { updateId } = req.params;
        const result = await approveEdgeUpdate(parseInt(updateId));
/*
        if (!result) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFound);
        }*/

        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.WeightUpdateApprovalSuccess);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Rejects an update request.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A status message indicating the result of the rejection.
 */
export const rejectUpdate = async (req: Request, res: Response) => {
    try {
        const { updateId } = req.params;
        const result = await rejectEdgeUpdate(parseInt(updateId));
/*
        if (!result) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateRequestNotFound);
        }*/

        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.WeightUpdateRejectionSuccess);
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