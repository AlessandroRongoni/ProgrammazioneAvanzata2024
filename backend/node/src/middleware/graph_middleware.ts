import { Request, Response, NextFunction } from 'express';
import { findEdgeById, findEdgesByGraphId, findGraphById, findGraphByName, findNodesByGraphId, subtractTokensByEmail } from '../db/queries/graph_queries';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500 } from "../status/status_codes";
import { getJwtEmail } from '../utils/jwt_utils';
import { findUser, findUserById } from '../db/queries/user_queries';
import {findUpdateById } from '../db/queries/update_queries';
import dotenv = require('dotenv');
import { calculateCost } from '../utils/graph_utils';
import { GraphModel } from '../models/GraphModel';
import { stat } from 'fs';
import { EdgeModel } from '../models/EdgeModel';
dotenv.config();
var update_cost_per_edge = parseFloat(process.env.UPDATE_COST_PER_EDGE!) || 0.025;
var statusMessage: MessageFactory = new MessageFactory();



/**
 * Middleware function to check user tokens before creating a graph.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves to void.
 */
export const checkUserTokensCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jwtUserEmail = getJwtEmail(req);

        if (!jwtUserEmail) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);
        }

        const user = await findUser(jwtUserEmail);
        if (!user) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        }

        // Calcola il costo totale basato sui nodi e sugli archi forniti nella richiesta
        const totalCost = calculateCost(req.body.nodes.length, req.body.edges.length);

        if (user[0].dataValues.tokens < totalCost) {
            return statusMessage.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokens);
        }

        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Middleware per la validazione dell'aggiornamento dei pesi degli archi.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Una risposta HTTP con uno stato specifico in caso di errore.
 */
export const validateEdgeWeightsUpdate = async (req: Request, res: Response, next: NextFunction) => {
    const new_weight = req.body.newWeight;
    try{
        if (!new_weight || new_weight < 0 || typeof new_weight !== 'number') {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
        }
        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Validates the creation of edge weights.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns If the edge weights are invalid, returns a bad request status message. Otherwise, calls the next function.
 */
export const validateEdgeWeightsCreation = async (req: Request, res: Response, next: NextFunction) => {
    const edges = req.body;

    if (!edges || !Array.isArray(edges) || edges.some(edge => typeof edge.weight !== 'number' || edge.weight < 0)) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
    }
    next();
};

/**
 * Middleware per validare la struttura di un grafo.
 * Verifica la presenza e la correttezza dei nodi, degli archi e dei pesi degli archi.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const validateGraphStructure = async (req: Request, res: Response, next: NextFunction) => {
    const { nodes, edges, name, description } = req.body;

    try {
        // Controlli sul nome e la descrizione con messaggi specifici
        if (typeof name !== 'string' || name.trim() === '') {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "Il nome del grafo è richiesto e non può essere vuoto.");
        }
        if (name.length > 50) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "Il nome del grafo non può superare i 50 caratteri.");
        }

        if (typeof description !== 'string') {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "La descrizione deve essere una stringa.");
        }
        if (description.length > 150) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "La descrizione non può superare i 150 caratteri.");
        }

        // Verifica l'unicità del nome nel database con messaggio specifico
        const existingGraph = await findGraphByName(name);
        if (existingGraph.length !== 0) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, `Il nome del grafo '${name}' è già in uso.`);
        }

        // Controlli sui nodi
        if (!Array.isArray(nodes)) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "I nodi devono essere forniti in un array.");
        }
        if (nodes.length === 0) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "L'array dei nodi non può essere vuoto.");
        }
        if (new Set(nodes).size !== nodes.length) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "Sono stati rilevati nodi duplicati nell'array dei nodi.");
        }

        // Controlli sugli archi
        if (!Array.isArray(edges) || edges.length === 0) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, "Gli archi devono essere forniti in un array non vuoto.");
        }

        const nodeSet = new Set(nodes);
        const edgeSet = new Set();
        const connectedNodes = new Set(); // Utilizzato per verificare che tutti i nodi siano collegati

        for (const edge of edges) {
            const { startNode, endNode, weight } = edge;

            // Controllo per nodi non definiti negli archi
            if (!nodeSet.has(startNode) || !nodeSet.has(endNode)) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, `L'arco contiene nodi non definiti: '${startNode}' o '${endNode}' non sono presenti nell'elenco dei nodi.`);
            }

            if (!startNode || !endNode || startNode === endNode || typeof weight !== 'number' || weight <= 0) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, `Arco non valido tra '${startNode}' e '${endNode}': verifica che entrambi i nodi esistano, siano diversi e il peso sia valido.`);
            }

            const edgeString = `${startNode}->${endNode}`;
            const reciprocalEdgeString = `${endNode}->${startNode}`;
            if (edgeSet.has(reciprocalEdgeString)) {
                return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotReciprocal);
            }

            edgeSet.add(edgeString);
            connectedNodes.add(startNode);
            connectedNodes.add(endNode);
        }

        // Verifica che tutti i nodi siano collegati
        if (nodeSet.size !== connectedNodes.size) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnconnectedNodes);
        }

        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Middleware per verificare l'appartenenza di un arco a un grafo.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Una Promise che rappresenta l'esecuzione asincrona del middleware.
 */
export const checkEdgeBelonging = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const graphId = req.body.graphId;
        const edgeId = req.body.edgeId;
        const edge = await findEdgeById(edgeId);
        if (!edge) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotFound);
        }
        if (edge.graph_id != graphId) {
            return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotInn);
        }
        next();
    } catch (error) {
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

// Middleware per validare l'ID del grafo e i nodi di partenza e arrivo
export const validateNodes = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId, startNode, endNode } = req.body;

    if (!startNode || typeof startNode !== 'string' || !endNode || typeof endNode !== 'string') {
        return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.InvalidNodes);
    }
    
    next();
  };

  export const checkNodesExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId, startNode, endNode } = req.body;

    try {
        // Verifica l'esistenza di startNode e endNode nel database
        const nodes = await findNodesByGraphId(graphId);
        const startNodeExists = nodes.some((node: any) => node === startNode);
        const endNodeExists = nodes.some((node: any) => node === endNode);

        if (!startNodeExists || !endNodeExists) {
            return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.NodeNotFound);
        }

        next();
    } catch (error) {
        return statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);

    }
};

  // Middleware per controllare l'esistenza degli archi nel grafo
export const checkEdgesExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId } = req.body;
  
    const edges = await findEdgesByGraphId(graphId);
    if (!edges || edges.length === 0) {
        return statusMessage.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.EdgeNotFound);
    }
      next();
  };

/** Controllo se esiste l'update passando l'id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkUpdateExistence = async (req: Request, res: Response, next: NextFunction) => {
    const updateId = Number(req.body.updateId); // Converte in numero, NaN se non è convertibile

    try {
        // Controlla se updateId non è un numero o è minore di 1 (consentendo solo valori positivi validi)
        if (isNaN(updateId) || updateId < 1) {
            return statusMessage.getStatusMessage(
                CustomStatusCodes.BAD_REQUEST,
                res,
                isNaN(updateId) ? Messages400.NotANumber : Messages400.UpdateRequired
            );
        }
        next();
    } catch (error) {
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

export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
    const { dateFilter } = req.body;
    let startDate, endDate;

    // Controlla che le date siano stringhe
    if (dateFilter?.from && typeof dateFilter.from !== 'string') {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DateString);
    }
    if (dateFilter?.to && typeof dateFilter.to !== 'string') {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DateString);
    }

    // Gestisce i casi in cui le date sono stringhe vuote convertendole in undefined
    if (dateFilter?.from?.trim() !== '') {
        startDate = new Date(dateFilter.from);
    }
    if (dateFilter?.to?.trim() !== '') {
        endDate = new Date(dateFilter.to);
    }

    // Controlla la validità delle date convertite
    if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);
    }
    
    // Assicura che la data di inizio non sia successiva alla data di fine
    if (startDate && endDate && startDate > endDate) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDateReverse);
        
    }

    next();
};

export const validateStatus = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

     // Verifica che status sia una stringa
     if (status && typeof status !== 'string') {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.StatusString);
        
    }

    // Permette solo "accepted", "rejected", o una stringa vuota come valori validi per lo stato
    if (status && status.trim() !== '' && status !== 'accepted' && status !== 'rejected') {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.AllowStatus);
    }


    next();
};