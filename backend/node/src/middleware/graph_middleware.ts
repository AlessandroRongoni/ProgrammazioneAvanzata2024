import { Request, Response, NextFunction } from 'express';
import { findEdgeById, findGraphById, findGraphByName, subtractTokensByEmail } from '../db/queries/graph_queries';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500 } from "../status/status_codes";
import { getJwtEmail } from '../utils/jwt_utils';
import { findUser, findUserById } from '../db/queries/user_queries';
import {findUpdateById } from '../db/queries/update_queries';
import dotenv = require('dotenv');
import { calculateCost } from '../utils/graph_utils';
import { GraphModel } from '../models/GraphModel';
import { stat } from 'fs';
dotenv.config();
var update_cost_per_edge = parseFloat(process.env.UPDATE_COST_PER_EDGE!) || 0.025;
var statusMessage: MessageFactory = new MessageFactory();


//Controlla se l'utente autenticato ha abbastanza token per completare l'operazione SERGY MODIFICA
export const checkUserTokensCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let jwtUserEmail = getJwtEmail(req);
        if (!jwtUserEmail) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);
        }
        const user = await findUser(jwtUserEmail);
        if (!user) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        }
        const totalNodes = req.body.nodes.length;
        const totalEdges = req.body.edges.length;
        const totalCost = calculateCost(totalNodes, totalEdges); 
        if (user.tokens <= 0 || user.tokens < totalCost) {
            statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokens);
        }
        next();
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
}
};

//Valida i pesi degli archi inviati nella richiesta. Verifica che l'array edges sia presente, che sia un array, e che tutti gli archi abbiano pesi validi (numerici e non negativi)
export const validateEdgeWeightsUpdate = (req: Request, res: Response, next: NextFunction) => {
    const new_weight = req.body.newWeight;
    try{
        if (!new_weight || new_weight < 0 || typeof new_weight !== 'number') {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
        }
        next();
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


//RICORDATI SERGY DI AGGIUNGERE IL MIDDLEWARE PER LA CREAZIONE DEI GRAFI
export const validateEdgeWeightsCreation = (req: Request, res: Response, next: NextFunction) => {
    const edges = req.body;

    if (!edges || !Array.isArray(edges) || edges.some(edge => typeof edge.weight !== 'number' || edge.weight < 0)) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
    }

    next();
};

/**
 * Middleware per validare la struttura di un grafo.
 * Verifica la presenza e la correttezza dei nodi, degli archi e dei pesi degli archi.
 */
export const validateGraphStructure = (req: Request, res: Response, next: NextFunction) => {
    const { nodes, edges } = req.body;
    try{
        // Verifica la presenza dei nodi e degli archi
        if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoNodes);
        }
    
        if (!edges || !Array.isArray(edges)) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoEdges);
        }
    
        // Verifica la validità dei pesi degli archi
        const invalidEdges = edges.filter((edge: { weight: number; }) => typeof edge.weight !== 'number' || edge.weight < 0);
        if (invalidEdges.length > 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
        }
    
        next();

    }catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Controllo per vedere se un arco appartiene al grafo passato nel body (DA RIVEDERE)
 */
export const checkEdgeBelonging = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const graphId = req.body.graphId;
        const edgeId = req.body.edgeId;
        const edge = await findEdgeById(edgeId);
        if (!edge) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotFound);
        }
        if (edge.graph_id != graphId) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotInn);
        }
        next();
    } catch (error) {
        console.error(error);
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Controllo esistenza di un grafo
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkGraphExistence = async (req: Request, res: Response, next: NextFunction) => {
    const graphId = req.body.graphId;
    try {
        const graph = await findGraphById(graphId);
        if (!graph) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.GraphNotFound);
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/** Controllo se esiste l'update passando l'id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkUpdateExistence = async (req: Request, res: Response, next: NextFunction) => {
    const updateId = req.body.updateId;
    try {
        if (!updateId) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateRequired);
        }
        if (updateId < 0 || isNaN(updateId)) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);

        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/** 
 * Controllo se l'Update ha lo stato approved NULL
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkUpdatePending = async (req: Request, res: Response, next: NextFunction) => {
    const updateId = req.body.updateId;
    try {
        const update = await findUpdateById(updateId);
        if (update.approved != null) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateAlreadyAwnsered);
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Controllo se il l'upgrade corrisponde ad un grafo a cui chi fa la richiesta
 * è proprietario
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkOwner = async (req: Request, res: Response, next: NextFunction) => {
    const updateId = req.body.updateId;
    let JwtUserEmail = getJwtEmail(req);
    try {
        const updates = await findUpdateById(updateId);
        const receiver = await findUserById(updates.receiver_id);
        if (receiver[0].dataValues.email != JwtUserEmail) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotOwner);
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }

};



/**
 * Controllo se tutti gli archi passati appartengono al grafo
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkAllEdgesBelongingAndCorrectWeights = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId, updates } = req.body;
    try {
        for (let i = 0; i < updates.length; i++) {
            console.log("Sono nel for")
            const edge = await findEdgeById(updates[i].edgeId);
            if (!edge) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotFound);
            }
            if (edge.graph_id != graphId) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotInn);
            }
            if (updates[i].newWeight < 0 || typeof updates[i].newWeight !== 'number' || !updates[i].newWeight) {
                console.log("Sono nell'if weight validation")
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
            }
        }
        console.log("Ho passato la validazione dei pesi e degli archi")
        next();
    }catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }

};

/**
 * Controllo per vedere se un utente ha abbastanza tokens per fare upgrade
 * 
 * @param req
 * @param res
 * @param next
 * @returns
 * 
 */
export const checkUserTokensUpdate = async (req: Request, res: Response, next: NextFunction) => {
    let jwtUserEmail = getJwtEmail(req);
    const { graphId, updates } = req.body;
    try {
        const user = await findUser(jwtUserEmail);
        if (user[0].dataValues.tokens <= 0) { 
            return statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokensUpdate);
        }
        const totalEdges = updates.length;
        const costoUpgrade = totalEdges * update_cost_per_edge;
        if (user[0].dataValues.tokens < costoUpgrade) {
            res.status(200).json({ message: "Costo operazione: " + costoUpgrade + ", tokens utente: " + user[0].dataValues.tokens});
            return statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokensUpdate);
        }
        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/** Controllo se esistono tutti gli upgrade passati
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkUpdatesExistence = async (req: Request, res: Response, next: NextFunction) => {
    const {request} = req.body;
    try {
        if (!request || request.length === 0) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.RequestNotFound);
        }
        for(let i = 0; i < request.length; i++){
            const update = await findUpdateById(request[i].updateId);
            if (!update) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateNotFound);
            }
            if (update.update_id <= 0 || isNaN(update.update_id)) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);
    
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Controllo se gli upgrade corrispondono ad un grafo 
 * a cui, chi fa la richiesta, è proprietario
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkOwnerGraphs = async (req: Request, res: Response, next: NextFunction) => {
    const {request} = req.body;
    let JwtUserEmail = getJwtEmail(req);
    try {
        for(let i = 0; i < request.length; i++){
            const updates = await findUpdateById(request[i].updateId);
            const receiver = await findUserById(updates.receiver_id);
            if (receiver[0].dataValues.email != JwtUserEmail) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotOwner);
            }
        }
        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }

};

/** 
 * Controllo se tutti  gli Update hanno lo stato approved NULL
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkUpdatesArePending = async (req: Request, res: Response, next: NextFunction) => {
    const {request} = req.body;
    try {
        for(let i = 0; i < request.length; i++){
            const update = await findUpdateById(request[i].updateId);
            if (update.approved != null) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateAlreadyAwnsered);
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Controllo che gli updateID siano diversi tra loro quando
 * passati nella richiesta
 * @param req
 * @param res
 * @param next
 * @returns
 * 
 */
export const checkUpdatesAreDifferent = async (req: Request, res: Response, next: NextFunction) => {
    const {request} = req.body;
    try {
        for(let i = 0; i < request.length; i++){
            for(let j = i + 1; j < request.length; j++){
                if(request[i].updateId === request[j].updateId){
                    return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateNotDifferent);
                }
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/** 
 * Validazione delle risposte che possono solo essere true o false
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const checkValidationAnswer = (req: Request, res: Response, next: NextFunction) => {
    const {request} = req.body;
    try {
        for(let i = 0; i < request.length; i++){
            if(request[i].answer !== true && request[i].answer !== false){
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateAnswerValidation);
            }
        }
        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


export const validateGraphNameAndDescription = async (req: Request, res:Response, next: NextFunction) => {
    const { name, description } = req.body;
    // Controllo che il nome sia fornito e sia una stringa non vuota
    if (typeof name !== 'string' || name.trim() === '') {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphValidation);
    }

    // Controllo che la descrizione sia una stringa e non superi i 250 caratteri
    if (typeof description !== 'string' || description.length > 250) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DescriptionValidation);
    }

    try {
        // Verifica l'unicità del nome nel database
        const existingGraph = await findGraphByName(name);
        if (existingGraph) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNameNotUnique);
        }
        // Se non ci sono errori, passa al middleware/route successivo
        next();
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};