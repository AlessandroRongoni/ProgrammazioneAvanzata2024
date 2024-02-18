import { Request, Response, NextFunction } from 'express';
import { findAllGraphs, findEdgeById, findEdgesByGraphId, findGraphById, subtractTokensByEmail } from '../db/queries/graph_queries';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500, Messages200 } from "../status/status_codes";
import { getJwtEmail } from '../utils/jwt_utils';
import { findUser, findUserById } from '../db/queries/user_queries';
import {findUpdateById, findUpdatesByEdgeId, findUpdatesByUserAndDate, requestEdgeUpdate } from '../db/queries/update_queries';

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
        if (user.tokens <= 0 || user.tokens < 0.025) { //invece di 0.025 va il caloclo del total cost con calculateCost
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokens);
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


export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
    const startDate = req.query.startDate;
    const endDate = req.body.endDate

    if (!startDate || !endDate) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoDate);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);
    }

    if (start.getTime() === end.getTime()) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDateSame);
    }

    if (start > end) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);
    }

    next();
};

export const verifyLoadUpdateHistory = async (req: Request, res: Response, next: NextFunction) => {
    const userId: any = await findUser(req.body.email);
    const { startDate, endDate } = req.query;

    // Assicurati che startDate e endDate siano stringhe
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoDate);
    }

    // Converti le stringhe delle date in oggetti Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
        const updateHistory = await findUpdatesByUserAndDate(userId, start, end);

        if (updateHistory.length === 0) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.NoStoric);
        }

        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
        updates.forEach(async (update: { edgeId: any; newWeight: any; }) => {
            const { edgeId, newWeight } = update;
            const edge = await findEdgeById(edgeId);
            if (!edge) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotFound);
            }
            if (edge.graph_id != graphId) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotInn);
            }
            if (newWeight.length === 0) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightIsRequired);
            
            }
            if (newWeight < 0 || typeof newWeight !== 'number' || !newWeight) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
            }
        });
        next();
    }catch (error) {
        console.error(error);
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
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokensUpdate);
        }
        const totalEdges = updates.length;
        console.log("Total edges: ", totalEdges);
        const costoUpgrade = totalEdges * 0.025;
        if (user[0].dataValues.tokens < costoUpgrade) {
            res.status(200).json({ message: "Costo operazione: " + costoUpgrade + ", tokens utente: " + user[0].dataValues.tokens + " - Non hai abbastanza tokens per fare l'upgrade" });
           
        }
        await subtractTokensByEmail(jwtUserEmail, costoUpgrade);
        next();
    } catch (error) {
        console.error(error);
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};