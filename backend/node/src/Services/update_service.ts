import { Request, Response } from 'express';
import { findEdgeUpdatesByReceiver, approveEdgeUpdate, rejectEdgeUpdate, findUpdatesByUserAndDate } from '../db/queries/update_queries';
import { findUser } from "../db/queries/user_queries";
import { formatJsonForDb } from '../utils/graph_utils';
import { CustomStatusCodes, Messages400, Messages200, Messages500 } from '../status/status_codes';
import { MessageFactory } from '../status/messages_factory';

var statusMessage: MessageFactory = new MessageFactory();

// Visualizza le richieste di aggiornamento pendenti per un receiver specificato
export const viewPendingUpdates = async (req: Request, res: Response) => {
    try {
        const receiverId: any = await findUser(req.body.email);
        const pendingUpdates = await findEdgeUpdatesByReceiver(receiverId);

        if (pendingUpdates.length === 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateRequestNotFound);
        }

        res.status(200).json(pendingUpdates);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages500.InternalServerError);
    }
};

// Approva una richiesta di aggiornamento specifica
export const approveUpdate = async (req: Request, res: Response) => {
    try {
        const { updateId } = req.params;
        const result = await approveEdgeUpdate(parseInt(updateId));

        if (!result) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateRequestNotFound);
        }

        return statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.WeightUpdateApprovalSuccess);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

// Rifiuta una richiesta di aggiornamento specifica
export const rejectUpdate = async (req: Request, res: Response) => {
    try {
        const { updateId } = req.params;
        const result = await rejectEdgeUpdate(parseInt(updateId));

        if (!result) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateRequestNotFound);
        }

        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages200.WeightUpdateRejectionSuccess);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages500.InternalServerError);
    }
};


// Visualizza lo storico delle richieste di aggiornamento approvate o rifiutate, filtrato per data
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

        const updateHistory = await findUpdatesByUserAndDate(userId, start, end);

        if (updateHistory.length === 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoStoric);
        }

        res.status(200).json(updateHistory);
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages500.InternalServerError);
    }
};