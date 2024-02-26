import { Request, Response, NextFunction } from "express";
import { findUser } from "../db/queries/user_queries";
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400 } from "../status/status_codes";
import { getJwtEmail } from "../utils/jwt_utils";

const isNonNegativeNumber = (value: any): boolean => !isNaN(value) && value >= 0;
const isEmailValid = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

/**
 * Middleware per verificare il corpo della richiesta contenente i token.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare alla prossima funzione middleware.
 */
export const checkTokensBody = async (req: Request, res: Response, next: NextFunction) => {
    const { tokens } = req.body;
    if (isNonNegativeNumber(tokens)) {
        next();
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, isNaN(tokens) ? Messages400.NotANumber : Messages400.NegativeTokens);
    }
};

/**
 * Middleware per verificare la validità di una password.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export const checkPassword = (req: Request, res: Response, next: NextFunction) => {
    const password = req.body.password;
    const expression: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/i;

    if (password.length !== 0) {
        if (isNaN(password)) {
            let checker: boolean = expression.test(password);
            if (checker) {
                next();
            } else {
                MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordCheck);
            }
        } else {
            MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.IsANumber);
        }
    } else {

        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordEmpty);
    }
};

/**
 * Verifica se la password corrisponde all'utente nel database.
 * Se la password corrisponde, passa al middleware successivo.
 * Altrimenti, restituisce un messaggio di errore corrispondente.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export const checkPasswordMatch = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length !== 0) {
        if (user[0].password == req.body.password) {
            next();
        } else {
            MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordNotMatch);
        }
        
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};

/**
 * Middleware per verificare la presenza e la validità di un indirizzo email.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Un messaggio di errore se l'indirizzo email è mancante o non valido.
 */
export const checkEmail = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailEmpty);
    }
    if (isEmailValid(email)) {
        next();
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailCheck);
    }
};

/**
 * Controlla se l'utente esiste nel database.
 * Se l'utente esiste, passa la richiesta al middleware successivo.
 * Se l'utente non esiste, restituisce un messaggio di errore.
 * 
 * @param req - L'oggetto della richiesta HTTP.
 * @param res - L'oggetto della risposta HTTP.
 * @param next - La funzione per passare la richiesta al middleware successivo.
 */
export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length !== 0) {
        next();
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};

/**
 * Controlla se l'utente non è registrato.
 * 
 * @param req - L'oggetto richiesta HTTP.
 * @param res - L'oggetto risposta HTTP.
 * @param next - La funzione per passare alla prossima middleware.
 */
export const checkUserNotRegistered = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length === 0) {
        next();
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnauthorizedUser);
    }
};

/**
 * Middleware per verificare se l'utente è autenticato tramite JWT.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export const checkUserJwt = async (req: Request, res: Response, next: NextFunction) => {
    let jwtUserEmail = getJwtEmail(req);
    const user: any = await findUser(jwtUserEmail);
    if (user.length !== 0) {
        next();
    } else {
        MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};
