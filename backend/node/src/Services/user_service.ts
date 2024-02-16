import { findUser, createUserDb, findAllUsers } from '../db/queries/user_queries';
import { Request, Response } from "express";
import { MessageFactory } from '../status/messages_factory'
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes'
import { updateUserTokensDb } from '../db/queries/admin_queries';
import { getJwtEmail } from './jwt_service';
import { verifyIsUser} from '../utils/user_utils';

let statusMessage: MessageFactory = new MessageFactory();

/**
 * Ottiene tutti gli utenti nel database e restituisce una risposta con l'elenco degli utenti.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function getAllUsersService(res: Response) {
    try {
        const users: any = await findAllUsers();
        let message = JSON.parse(JSON.stringify({ users: users }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);

    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

/**
 * Crea un nuovo utente nel database in base alla richiesta e restituisce una risposta di successo.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function createUserService(req: Request, res: Response) {
    try {
        const user: any = await findUser(req.body.email);
        if (user.length == 0) {
            await createUserDb(req);
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UserCreateSuccess);
        }
        else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnauthorizedUser);
        };
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

/**
 * Ottiene i token di un utente dal database in base alla richiesta e restituisce una risposta con il numero di token.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function getTokensService(req: Request, res: Response) {
    try {
        let jwtPlayerEmail = getJwtEmail(req);
        const user: any = await findUser(jwtPlayerEmail);
        if (user.length != 0) {
            const tokens = parseFloat(user[0].dataValues.tokens);
            let message = JSON.parse(JSON.stringify({ tokens: tokens }))
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

