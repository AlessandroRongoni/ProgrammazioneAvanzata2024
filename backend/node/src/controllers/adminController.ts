import { updateUserTokensService } from '../Services/admin_service';
import { Request, Response } from "express";

/**
 * Aggiorna i token dell'utente.
 * Richiama il servizio updateUserTokensService per l'aggiornamento dei token.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const updateTokens = (req: Request, res: Response) => {
    return updateUserTokensService(req, res);
};