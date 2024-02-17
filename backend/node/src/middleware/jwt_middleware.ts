import { decodeJwt } from "../utils/jwt_utils"
import { Request, Response, NextFunction } from "express";
import { CustomStatusCodes, Messages400 } from "../status/status_codes";
import { MessageFactory } from "../status/messages_factory";

var statusMessage: MessageFactory = new MessageFactory();
/**
 * Controlla la validità del token JWT nell'intestazione della richiesta.
 * Verifica se il token JWT è presente e decodificabile correttamente.
 * Restituisce un errore 401 se il token JWT è mancante o non valido.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    const jwtBearerToken = req.headers.authorization;
    const jwtDecode = jwtBearerToken ? decodeJwt(jwtBearerToken) : null;

    if (jwtDecode && jwtDecode.email && jwtDecode.password) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.Unauthorized);
    }
};
