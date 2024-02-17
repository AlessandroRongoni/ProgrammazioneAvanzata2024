import { Request, Response, NextFunction } from 'express';
import { findAllGraphs, findEdgeById, findEdgesByGraphId, findGraphById, requestEdgeUpdate, subtractTokensByEmail } from '../db/queries/graph_queries';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500, Messages200 } from "../status/status_codes";
import { getJwtEmail } from '../utils/jwt_utils';
import { findUser, findUserById } from '../db/queries/user_queries';

var statusMessage: MessageFactory = new MessageFactory();



//Verifica che l'utente che effettua la richiesta per la modifica sia il proprietario del grafo specificato
export const checkGraphOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jwtUserEmail = getJwtEmail(req);
        if (!jwtUserEmail) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.Unauthorized);
        }
        const graphId = req.body.graphId;
        const graph = await findGraphById(graphId);
        console.log("graphId: ", graphId);
        if (!graph) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNotFound);
        }
        const ownerGraph = await findUserById(graph.user_id);
        console.log("ownerGraph: ", ownerGraph.email);
        if (!(ownerGraph.email == jwtUserEmail)) {
            console.log("Sono dentro")
            const RequesterId = await findUser(jwtUserEmail);
            const RichiestaUpdate = requestEdgeUpdate(req.body.edgeId,RequesterId.id,ownerGraph.id, req.body.weight);
            if (!RichiestaUpdate) {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UpdateRequestNotFound);
            }
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UpdateNotification);
        }
        console.log("Avanti savoia")
        next();
    } catch (error) {
    statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
}
};




//Controlla se l'utente autenticato ha abbastanza token per completare l'operazione
export const checkUserTokensUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let jwtUserEmail = getJwtEmail(req);
        if (!jwtUserEmail) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);
        }
        const user = await findUser(jwtUserEmail);
        if (!user) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        }
        if (user.tokens <= 0 || user.tokens < 0.025) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokens);
        }
        const newTokens = subtractTokensByEmail(jwtUserEmail, 0.025);
        if (!newTokens) {
            statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages400.InvalidToken);
        }
        console.log("Tutto bene fin qui!");
        next();
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
}
};

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

    if (!new_weight || new_weight < 0 || typeof new_weight !== 'number') {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.WeightValidation);
    }
    next();
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
};



/**
 * Middleware per aggiornare il peso di un arco
 */



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
        if (edge.graphId != graphId) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNotFound);
        }
        next();
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
};
