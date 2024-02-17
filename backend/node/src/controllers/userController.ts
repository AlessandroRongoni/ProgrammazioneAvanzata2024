import { getJwtEmail } from '../utils/jwt_utils';
import { Request, Response } from "express";
import { createUserDb, findAllUsers, findUser } from '../db/queries/user_queries';
import { MessageFactory } from '../status/messages_factory';
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes';
var jwt = require('jsonwebtoken');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
var statusMessage: MessageFactory = new MessageFactory();

/**
 * Gestisce la richiesta di login dell'utente.
 * Richiama il servizio generateJwtService per generare il token JWT.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const payload = {
            email: email,
            password: password,
        };

        const jwtBearerToken = jwt.sign(payload, PRIVATE_KEY);
        let message = JSON.parse(JSON.stringify({ jwt: jwtBearerToken }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);

    }
};

/**
 * Ottiene i token dell'utente.
 * Richiama il servizio getTokensService per ottenere i token dell'utente.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const getUserTokens = async (req: Request, res: Response) => {
    try {
        let jwtPlayerEmail = getJwtEmail(req);
        const user: any = await findUser(jwtPlayerEmail);
        const tokens = parseFloat(user[0].dataValues.tokens);
        let message = JSON.parse(JSON.stringify({ tokens: tokens }))
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Crea un nuovo utente.
 * Richiama il servizio createUserService per creare un nuovo utente.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        await createUserDb(req);
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UserCreateSuccess);
        
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Ottiene tutti gli utenti.
 * Richiama il servizio getAllUsersService per ottenere tutti gli utenti registrati.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const getAllUsers = async (req: Request,res: Response) => {
    try {
        const users: any = await findAllUsers();
        let message = JSON.parse(JSON.stringify({ users: users }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);

    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};
















