import { generateJwtService } from '../services/jwt_service';
import { createUserService, getTokensService, getAllUsersService } from '../services/user_service';
import { Request, Response } from "express";
import { getAllEdgesOfGraph, getGraphsList, updateEdgeWeight } from '../middleware/graph_middleware';

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
export const getAllUsers = (req: Request,res: Response) => {
    return getAllUsersService(res);
};


/**
 * Ottiene tutti i grafi.
 * Richiama il middleware getGraphslist per ottenere tutti i grafi registrati.
 */
export const getAllGraphs = (req: Request,res: Response) => {
    return getGraphsList(res);
};

/**
 * Ottiene tutti gli archi di un grafo.
 * Richiama il middleware getGraphEdges per ottenere tutti gli archi di un grafo.
 * 
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 * 
 */
export const getGraphEdges = (req: Request,res: Response) => {
    return getAllEdgesOfGraph(req,res);
};

/**
 * Aggiorna i pesi di un arco di un grafo.
 * Richiama il middleware updateEdgeWeight per aggiornare i pesi di un arco di un grafo.
 * 
 * @param req - Oggetto della richiesta.
 * @param res - Oggetto della risposta.
 * @returns
 * 
 */
export const updateEdgesWeight = (req: Request,res: Response) => {
    return updateEdgeWeight(req,res);
};

