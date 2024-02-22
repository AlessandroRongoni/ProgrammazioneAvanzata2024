import { Request, Response, NextFunction } from 'express';
import { findEdgeById, findEdgesByGraphId, findGraphById, findGraphByName, findNodesByGraphId } from '../db/queries/graph_queries';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500 } from "../status/status_codes";
import { getJwtEmail } from '../utils/jwt_utils';
import { findUser, findUserById } from '../db/queries/user_queries';
import {findUpdateById } from '../db/queries/update_queries';
import dotenv = require('dotenv');
import { calculateCost, generateUndefinedNodesErrorMessage, validateEdgeErrorMessage, generateGraphNameInUseErrorMessage } from '../utils/graph_utils';

dotenv.config();
var update_cost_per_edge = parseFloat(process.env.UPDATE_COST_PER_EDGE!) || 0.025;



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
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);

        }

        const user = await findUser(jwtUserEmail);
        if (!user) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);

        }

        // Calcola il costo totale basato sui nodi e sugli archi forniti nella richiesta
        const totalCost = calculateCost(req.body.nodes.length, req.body.edges.length);

        if (user[0].dataValues.tokens < totalCost) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokens);

        }

        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
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
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoGraphName);

        }
        if (name.length > 50) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphLengthLimit);

        }

        if (typeof description !== 'string') {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DescriptionString);

        }
        if (description.length > 150) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DescriptionLenghtLimit);

        }

        // Verifica l'unicità del nome nel database con messaggio specifico
        const existingGraph = await findGraphByName(name);
        if (existingGraph && existingGraph.length > 0) {
            const errorMessage = generateGraphNameInUseErrorMessage(name);
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, errorMessage);

        }

        // Controlli sui nodi
        if (!Array.isArray(nodes)) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NodeArray);

        }
        if (nodes.length === 0) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NodeArray);

        }
        if (new Set(nodes).size !== nodes.length) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DuplicateNode);

        }

        // Controlli sugli archi
        if (!Array.isArray(edges) || edges.length === 0) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeArray);

        }

        const nodeSet = new Set(nodes);
        const edgeSet = new Set();
        const connectedNodes = new Set(); // Utilizzato per verificare che tutti i nodi siano collegati

        for (const edge of edges) {
            const { startNode, endNode, weight } = edge;

            // Controllo per nodi non definiti negli archi
            if (!nodeSet.has(startNode) || !nodeSet.has(endNode)) {
                const errorMessage = generateUndefinedNodesErrorMessage(startNode, endNode, nodeSet);
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, errorMessage);
            }

            if (!startNode || !endNode || startNode === endNode || typeof weight !== 'number' || weight <= 0) {
                const errorMessage = validateEdgeErrorMessage(startNode, endNode, weight);
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, errorMessage!);


            }

            const edgeString = `${startNode}->${endNode}`;
            const reciprocalEdgeString = `${endNode}->${startNode}`;
            if (edgeSet.has(reciprocalEdgeString)) {
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotReciprocal);

            }

            edgeSet.add(edgeString);
            connectedNodes.add(startNode);
            connectedNodes.add(endNode);
        }

        // Verifica che tutti i nodi siano collegati
        if (nodeSet.size !== connectedNodes.size) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnconnectedNodes);

        }

        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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

        // Verifica che graphId ci sia e che sia un numero
        if (!graphId || isNaN(Number(graphId))) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidGraphId);

        }

    try {
        const graph = await findGraphById(graphId);
        if (!graph) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.GraphNotFound);

        }
        next();
    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};


/**
 * Middleware per la validazione dei nodi.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al prossimo middleware.
 * @returns Una Promise che rappresenta l'esecuzione asincrona del middleware.
 */
export const validateNodes = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId, startNode, endNode } = req.body;

    if (!startNode || typeof startNode !== 'string' || !endNode || typeof endNode !== 'string') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.InvalidNodes);

    }
    
    next();
  };

/**
 * Verifica l'esistenza dei nodi specificati nel corpo della richiesta nel database.
 * Se uno o entrambi i nodi non esistono, viene restituito un messaggio di errore.
 * Altrimenti, viene chiamata la funzione successiva nella catena di middleware.
 * 
 * @param req - L'oggetto della richiesta HTTP.
 * @param res - L'oggetto della risposta HTTP.
 * @param next - La funzione per passare il controllo al successivo middleware.
 * @returns Un messaggio di errore o il controllo passato al successivo middleware.
 */
export const checkNodesExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId, startNode, endNode } = req.body;

    try {
        // Verifica l'esistenza di startNode e endNode nel database
        const nodes = await findNodesByGraphId(graphId);
        const startNodeExists = nodes.some((node: any) => node === startNode);
        const endNodeExists = nodes.some((node: any) => node === endNode);

        if (!startNodeExists || !endNodeExists) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.NodeNotFound);

        }
        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);

    }
};

  
/**
 * Controlla l'esistenza degli archi per un determinato grafo.
 * 
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 * @param next - La funzione per passare alla prossima funzione middleware.
 * @returns Un messaggio di stato se gli archi non sono presenti nel grafo.
 */
export const checkEdgesExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { graphId } = req.body;
  
    const edges = await findEdgesByGraphId(graphId);
    if (!edges || edges.length === 0) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.EdgeNotFound);

    }
      next();
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

            if (typeof updates[i].edgeId !== 'number') {
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);

            }

            const edge = await findEdgeById(updates[i].edgeId);
            if (!edge) {
                return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.EdgeNotFound);

            }
            if (edge.graph_id != graphId) {
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EdgeNotInn);

            }
            if (updates[i].newWeight < 0 || typeof updates[i].newWeight !== 'number' || !updates[i].newWeight) {
                console.log("Sono nell'if weight validation")
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);

            }
        }
        next();
    }catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
            return MessageFactory.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokensUpdate);

        }
        const totalEdges = updates.length;
        const costoUpgrade = totalEdges * update_cost_per_edge;
        if (user[0].dataValues.tokens < costoUpgrade) {
            res.status(200).json({ message: "Costo operazione: " + costoUpgrade + ", tokens utente: " + user[0].dataValues.tokens});
            return MessageFactory.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.NoTokensUpdate);

        }
        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
            return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.RequestNotFound);

        }
        for(let i = 0; i < request.length; i++){
            const update = await findUpdateById(request[i].updateId);
            if (!update) {
                return MessageFactory.getStatusMessage(CustomStatusCodes.NOT_FOUND, res, Messages400.UpdateNotFound);

            }
            if (update.update_id <= 0 || isNaN(update.update_id)) {
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);

                
    
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotOwner);

            }
        }
        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateAlreadyAwnsered);

            }
        }
        next();
    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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
                    return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateNotDifferent);

                }
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
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

            if (typeof request[i].updateId !== 'number') {
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);

            }

            if(request[i].answer !== true && request[i].answer !== false){
                return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateAnswerValidation);

            }
        }
        next();
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};

/**
 * Middleware per la validazione dell'intervallo di date.
 * 
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Un messaggio di errore se l'intervallo di date non è valido, altrimenti passa al middleware successivo.
 */
export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
    const { dateFilter } = req.body;
    let startDate, endDate;

    // Controlla che le date siano stringhe
    if (dateFilter?.from && typeof dateFilter.from !== 'string') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DateString);

    }
    if (dateFilter?.to && typeof dateFilter.to !== 'string') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.DateString);

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
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDate);

    }
    
    // Assicura che la data di inizio non sia successiva alla data di fine
    if (startDate && endDate && startDate > endDate) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidDateReverse);

        
    }

    next();
};


/**
 * Middleware per la validazione dello stato specificato nella richiesta.
 * @param {Request} req - L'oggetto richiesta.
 * @param {Response} res - L'oggetto risposta.
 * @param {NextFunction} next - La funzione next per passare al prossimo middleware.
 */
export const validateStatus = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

     // Verifica che status sia una stringa
     if (status && typeof status !== 'string') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.StatusString);

        
    }

    // Permette solo "accepted", "rejected", o una stringa vuota come valori validi per lo stato
    if (status && status.trim() !== '' && status !== 'accepted' && status !== 'rejected') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.AllowStatus);

    }


    next();
};

/**
 * Middleware per validare il formato di risposta specificato nella richiesta.
 * @param {Request} req - L'oggetto richiesta.
 * @param {Response} res - L'oggetto risposta.
 * @param {NextFunction} next - La funzione next per passare al prossimo middleware.
 */
export const validateFormat = (req: Request, res: Response, next: NextFunction) => {
    let { format } = req.body;
    const allowedFormats = ['csv', 'pdf', 'json', 'xml'];

    // Verifica che status sia una stringa
    if (format && typeof format !== 'string') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.FormatString);
    }
    // Imposta un formato predefinito se il campo 'format' è vuoto o non specificato
    if (!format || format.trim() === '') {
        format = 'json'; // Predefinito a JSON
        req.body.format = format; // Aggiorna il corpo della richiesta con il formato predefinito
    }

    next();
};


/**
 * Middleware per la validazione dei parametri di simulazione.
 * @param {Request} req - L'oggetto richiesta.
 * @param {Response} res - L'oggetto risposta.
 * @param {NextFunction} next - La funzione next per passare al prossimo middleware.
 */
export const validateSimulationParameters = (req: Request, res: Response, next: NextFunction) => {
    const { startWeight, endWeight, step } = req.body;
    
    if (typeof startWeight !== 'number' || typeof endWeight !== 'number' || typeof step !== 'number') {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidSimulationValue);

    }

    if (startWeight >= endWeight) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.InvalidSimulationReverse);

    }
    if (step <= 0) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NegativeOrNullStep);

    }
    next();
};


/**
 * Middleware per la validazione dei parametri di simulazione.
 * @param {Request} req - L'oggetto richiesta.
 * @param {Response} res - L'oggetto risposta.
 * @param {NextFunction} next - La funzione next per passare al prossimo middleware.
 */
export const validateStartEndNodes = (req: Request, res: Response, next: NextFunction) => {
    const { startNode, endNode } = req.body;
    try {
        // Controlla se lo startNode è uguale all'endNode
        if (startNode === endNode) {
            return MessageFactory.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.StardEndNodeCoincide);
    
        }
        next();
        
    } catch (error) {
        return MessageFactory.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }

};