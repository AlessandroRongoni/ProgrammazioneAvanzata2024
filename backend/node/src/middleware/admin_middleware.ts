import { findUser, checkPassword } from "../db/queries/user_queries";
import { decodeJwt } from "../utils/jwt_utils";
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500 } from "../status/status_codes";
import { Request, Response, NextFunction } from "express";

var statusMessage: MessageFactory = new MessageFactory();

/**
 * Verifica se l'utente è un amministratore.
 * Controlla se l'utente autenticato nell'autorizzazione JWT è un amministratore.
 * Restituisce un errore 401 se l'utente non è autorizzato o un errore 500 se si verifica un errore interno.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkIsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jwtBearerToken = req.headers.authorization;
        const jwtDecode = jwtBearerToken != null ? decodeJwt(jwtBearerToken) : null;

        if (jwtDecode != null) {
            const user = await findUser(jwtDecode.email);
            const pass = await checkPassword(jwtDecode.email, jwtDecode.password);
            if (user.length != 0 && user[0].dataValues.isadmin && pass.length != 0 && pass[0].dataValues.password === jwtDecode.password && pass[0].dataValues.email === jwtDecode.email) {
                next();
            } else {
                statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.Unauthorized);
            }
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.Unauthorized);
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};