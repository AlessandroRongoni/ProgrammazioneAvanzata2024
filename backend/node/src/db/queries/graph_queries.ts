// Importa la richiesta Express per gestire le richieste HTTP
import { Request } from "express";
import { Op } from 'sequelize';
// Importa il modello degli utenti
import { UserModel } from '../../models/UserModel';
// Importa il modello per i grafici
import { GraphModel } from '../../models/GraphModel';
// Importa il modello per gli archi
import { EdgeModel } from '../../models/EdgeModel';
// Importa il modello per gli aggiornamenti degli archi
import { UpdateModel } from '../../models/UpdateModel';
import sequelize from "sequelize";




// Funzione per trovare un grafico nel database in base all'ID del grafico
export async function findGraphById(graphId: number): Promise<any> {
    return await GraphModel.findByPk(graphId);
}

// Funzione per trovare tutti i grafici creati da un utente specifico
export async function findGraphsByUserId(userId: number): Promise<any> {
    return await GraphModel.findAll({
        where: {
            user_id: userId,
        }
    });
}

// Funzione per trovare tutti i grafici presenti nel database
export async function findAllGraphs(): Promise<any> {
    return await GraphModel.findAll();
}



// Funzione per trovare tutti gli archi di un grafico specifico
export async function findEdgesByGraphId(graphId: number): Promise<any> {
    return await EdgeModel.findAll({
        where: {
            graph_id: graphId
        }
    });
}

// Funzione per trovare un arco specifico in base all'ID dell'arco
export async function findEdgeById(edgeId: number): Promise<any> {
    return await EdgeModel.findByPk(edgeId);
}


export async function createGraphQuery(userId: number, name: string, description: string): Promise<any> {
    return await GraphModel.create({
        user_id: userId,
        name: name,
        description: description
    });
}


export async function addEdgesToGraph(graphId: number, startNode: string, endNode: string, weight: number): Promise<any> {
        return EdgeModel.create({
            graph_id: graphId,
            start_node: startNode,
            end_node: endNode,
            weight: weight
        });

}

//Query per sottrarre tokens all'utente per email
export async function subtractTokensByEmail(email: string, tokens: number): Promise<any> {
    return await UserModel.update(
        { tokens: sequelize.literal(`tokens - ${tokens}`) },
        { where: { email: email } }
    );
}

//Query per cercare un grafo in base al nome
export async function findGraphByName(name: string): Promise<any> {
    return await GraphModel.findOne({
        where: {
            name: name
        }
    });
}


