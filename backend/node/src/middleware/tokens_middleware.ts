import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400 } from "../status/status_codes";
import { Request, Response, NextFunction } from "express";

var statusMessage: MessageFactory = new MessageFactory();

/**
 * Controlla la validità del campo "tokens" nella richiesta.
 * Verifica se il campo "tokens" è un numero non negativo.
 * Restituisce un errore 400 se il campo "tokens" non è valido.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkTokensBody = async (req: Request, res: Response, next: NextFunction) => {
    const tokens = req.body.tokens;
    if (!isNaN(tokens)) {
        if (tokens < 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NegativeTokens);
        }
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);
    }
};