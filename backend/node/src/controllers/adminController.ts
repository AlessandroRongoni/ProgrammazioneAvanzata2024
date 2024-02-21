import { updateUserTokensDb } from '../db/queries/admin_queries';
import { Request, Response } from "express";
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages400 } from '../status/status_codes';

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
        return MessageFactory.getStatusMessage(CustomStatusCodes.OK, res, message);

    } catch (e) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.TokensEmpty);
    }
};