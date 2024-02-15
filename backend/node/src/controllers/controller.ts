import { generateJwtService } from '../Services/jwt_service';
import { createUserService, getTokensService, getAllUsersService } from '../services/user_service';
import { Request, Response } from "express";

/**
 * Gestisce la richiesta di login dell'utente.
 * Richiama il servizio generateJwtService per generare il token JWT.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const login = (req: Request, res: Response) => {
    return generateJwtService(req, res);
};

/**
 * Ottiene i token dell'utente.
 * Richiama il servizio getTokensService per ottenere i token dell'utente.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const getUserTokens = (req: Request, res: Response) => {
    return getTokensService(req, res);
};

/**
 * Crea un nuovo utente.
 * Richiama il servizio createUserService per creare un nuovo utente.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const createUser = (req: Request, res: Response) => {
    return createUserService(req, res);
};

/**
 * Ottiene tutti gli utenti.
 * Richiama il servizio getAllUsersService per ottenere tutti gli utenti registrati.
 *
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 */
export const getAllUsers = (req: Request, res: Response) => {
    return getAllUsersService(res);
};





