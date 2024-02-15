import { Request, Response, NextFunction } from 'express';
import { findGraphById } from '../db/queries/graph_queries';
import { UserModel } from '../models/UserModel';
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400, Messages500 } from "../status/status_codes";

var statusMessage: MessageFactory = new MessageFactory();

//Estende l'oggetto Request di Express per includere
//un campo user opzionale, che può contenere 
//l'ID dell'utente. Questo viene utilizzato per memorizzare
//i dati dell'utente decodificati dal token JWT
interface CustomRequest extends Request {
    user?: { id: number; }
}

//Verifica che l'utente che effettua la richiesta sia il proprietario del grafo specificato nell'URL
export const checkGraphOwnership = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);
    }

    const graphId = parseInt(req.params.graphId);
    const graph = await findGraphById(graphId);

    if (!graph) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GraphNotFound);
    }

    if (graph.userId !== req.user?.id) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.Unauthorized);
    }

    next();
};




//Controlla se l'utente autenticato ha abbastanza token per completare l'operazione
export const checkUserTokens = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoAuthHeader);
    }

    const user = await UserModel.findByPk(req.user?.id);

    if (!user || user.tokens <= 0) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NotANumber);
    }

    next();
};

//Valida i pesi degli archi inviati nella richiesta. Verifica che l'array edges sia presente, che sia un array, e che tutti gli archi abbiano pesi validi (numerici e non negativi)
export const validateEdgeWeights = (req: CustomRequest, res: Response, next: NextFunction) => {
    const { edges } = req.body;

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