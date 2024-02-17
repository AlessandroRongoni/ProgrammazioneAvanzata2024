import { findUser } from "../db/queries/user_queries";
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400 } from "../status/status_codes";
import { Request, Response, NextFunction } from "express";
import { getJwtEmail } from "../utils/jwt_utils";

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

/**
 * Controlla la validità della password specificata nella richiesta.
 * Verifica se la password è non vuota e rispetta i requisiti minimi di complessità.
 * Restituisce un errore 400 se la password non è valida.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkPassword = (req: Request, res: Response, next: NextFunction) => {
    const password = req.body.password;
    const expression: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/i;

    if (password.length != 0) {
        if (isNaN(password)) {
            let checker: boolean = expression.test(password);
            if (checker) {
                next();
            } else {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordCheck);
            }
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.IsANumber);
        }
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordEmpty);
    }
};

/**
 * Controlla la validità del formato dell'indirizzo email specificato nella richiesta.
 * Verifica se l'indirizzo email è non vuoto e rispetta il formato standard.
 * Restituisce un errore 400 se l'indirizzo email non è valido.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkEmail = (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (email.length != 0) {
        if (isNaN(email)) {
            let checker: boolean = expression.test(email);
            if (checker) {
                next();
            } else {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailCheck);
            }
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.IsANumber);
        }

    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailEmpty);
    }
};


/**
 *  Controllo se esiste l'utente nel database
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length != 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};

/**
 * Controllo se l'utente è gia registrato nel database
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 * 
 */
export const checkUserNotRegistered = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length == 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnauthorizedUser);
    }
};

/**
 * Controllo se l'utente esiste tramite JWT
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkUserJwt = async (req: Request, res: Response, next: NextFunction) => {
    let jwtUserEmail = getJwtEmail(req);
    const user: any = await findUser(jwtUserEmail);
    if (user.length != 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};