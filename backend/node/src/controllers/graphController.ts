/*import { Request, Response } from "express";
import { EdgeModel } from "../models/EdgeModel"; // Assumi queste importazioni
import { GraphModel } from "../models/GraphModel"; // Assumi queste importazioni
import { UserModel } from "../models/UserModel"; // Assumi queste importazioni
import { UpdateModel } from "../models/UpdateModel"; // Assumi queste importazioni
import { findEdgeById, requestEdgeUpdate, updateEdgeWeightInDB, approveEdgeUpdate, findUpdatesByUserId } from "../db/queries/graph_queries";
import { checkIsAdmin } from "../middleware/admin_middleware"; // Middleware di autenticazione
import { checkJwt } from "../middleware/jwt_middleware"; // Middleware di autenticazione
import { calculateCost } from "../utils/graph_utils"; 
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();


const ALPHA = parseFloat(process.env.ALPHA || "0.8"); // Assicurati che ALPHA sia un numero


export const graphController = {
    async createGraph(req: Request, res: Response) {
        // Esempio di creazione di un nuovo grafo
        const { name, description, nodes, edges } = req.body;
        const userId? = req.user.id; // Assumi che l'ID utente venga estratto dal token JWT
    
        // Calcola il costo per la creazione del grafo
        // Assicurati che la funzione calculateCost sia definita per accettare un oggetto con proprietà nodes ed edges
        // Dove nodes ed edges sono rispettivamente il numero di nodi e di archi del grafo
        const cost = calculateCost('create', { nodes: nodes.length, edges: edges.length });
    
        // Verifica i token dell'utente
        const user = await UserModel.findByPk(userId);
        if (!user || user.tokens < cost) {
            return res.status(400).json({ message: "Token insufficienti" });
        }
    
        // Deduce i token dall'utente in base al costo calcolato
        user.tokens -= cost;
        await user.save();
    
        // Crea il grafo
        const graph = await GraphModel.create({
            userId: userId,
            name: name,
            description: description
        });
    
        // Aggiungi gli archi al grafo
        const edgePromises = edges.map(edge => {
            return EdgeModel.create({
                graphId: graph.id,
                startNode: edge.startNode,
                endNode: edge.endNode,
                weight: edge.weight
            });
        });
        await Promise.all(edgePromises);
    
        // Restituisce la risposta con il successo della creazione del grafo
        res.json({ message: "Grafo creato con successo", graph });
    },
    async updateEdgeWeight(req: Request, res: Response) {
        const { edgeId, newWeight } = req.body;
        const userId = req.user.id; // Assumi che l'ID dell'utente sia incluso nel JWT dopo l'autenticazione
    
        try {
            const edge = await findEdgeById(edgeId);
            if (!edge) {
                return res.status(404).json({ message: "Arco non trovato." });
            }
    
            const graph = await GraphModel.findByPk(edge.graphId);
            if (!graph || graph.userId !== userId) {
                return res.status(403).json({ message: "Non autorizzato a modificare questo arco." });
            }
    
            // Calcola il costo dell'aggiornamento
            const cost = calculateCost('update', { updatedEdges: 1 });
    
            const user = await UserModel.findByPk(userId);
            if (user.tokens < cost) {
                return res.status(400).json({ message: "Token insufficienti per aggiornare l'arco." });
            }
    
            const ALPHA = parseFloat(process.env.ALPHA || "0.8");
            const updatedWeight = ALPHA * edge.weight + (1 - ALPHA) * newWeight;
    
            await updateEdgeWeightInDB(edgeId, updatedWeight);
    
            // Dedurre il costo dall'utente
            user.tokens -= cost;
            await user.save();
    
            res.json({ message: "Peso dell'arco aggiornato con successo", edgeId, newWeight: updatedWeight });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore interno del server." });
        }
    },

// Funzione che gestisce l'approvazione della richiesta di aggiornamento
async approveUpdateRequest(req: Request, res: Response) {
    const { requestId } = req.body; // ID della richiesta di aggiornamento
    const userId = req.user.id; // ID dell'utente (creatore del grafo) che approva la richiesta

    try {
        const updateRequest = await findUpdatesByUserId(requestId);
        if (!updateRequest) {
            return res.status(404).json({ message: "Richiesta di aggiornamento non trovata." });
        }

        const edge = await findEdgeById(updateRequest.edgeId);
        if (!edge) {
            return res.status(404).json({ message: "Arco non trovato." });
        }

        const graph = await GraphModel.findByPk(edge.graphId);
        if (!graph || graph.userId !== userId) {
            return res.status(403).json({ message: "Non autorizzato ad approvare questa richiesta di aggiornamento." });
        }

        // Calcola il costo dell'aggiornamento
        const cost = calculateCost('update', { updatedEdges: 1 });

        // Assicurati che il creatore del grafo abbia abbastanza token per coprire il costo dell'operazione
        const user = await UserModel.findByPk(userId);
        if (user.tokens < cost) {
            return res.status(400).json({ message: "Token insufficienti per approvare l'aggiornamento dell'arco." });
        }

        // Procedi con l'aggiornamento del peso dell'arco
        const updatedWeight = updateRequest.newWeight; // Prendi il nuovo peso dalla richiesta di aggiornamento
        await updateEdgeWeightInDB(updateRequest.edgeId, updatedWeight);

        // Dedurre il costo dall'utente (creatore del grafo)
        user.tokens -= cost;
        await user.save();

        // Aggiorna lo stato della richiesta di aggiornamento come approvata
        await approveEdgeUpdate(requestId);

        res.json({ message: "Richiesta di aggiornamento approvata con successo", edgeId: updateRequest.edgeId, newWeight: updatedWeight });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Errore interno del server." });
    }
}

};
