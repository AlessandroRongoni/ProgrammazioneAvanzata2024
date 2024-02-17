import { updateUserTokensDb } from '../db/queries/admin_queries';
import { findUser } from '../db/queries/user_queries';
import { Request, Response } from "express";
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages400 } from '../status/status_codes';


var statusMessage: MessageFactory = new MessageFactory();
/**
 * Aggiorna i token dell'utente.
 * Richiama il servizio updateUserTokensService per l'aggiornamento dei token.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const updateTokens = async (req: Request, res: Response) => {
    try {
        await updateUserTokensDb(req.body.tokens, req.body.email);
        let message = JSON.parse(JSON.stringify({ tokens: req.body.tokens }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.TokensEmpty);

    }
};