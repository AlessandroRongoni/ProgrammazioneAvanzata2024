import { Request } from "express";
import { GraphModel } from "../../models/GraphModel";
import { EdgeModel } from "../../models/EdgeModel";



/**
 * Trova un utente nel database in base all'indirizzo email specificato.
 *
 * @param email - L'indirizzo email dell'utente da cercare nel database.
 * @returns Restituisce i dettagli dell'utente trovato.
 */
export async function findGraph(id: string): Promise<any> {

    return await GraphModel.findAll({
        where: {
            graph_id: id,
        }
    });

};

export async function findEdgesByGraph(id: number, edge_id: number): Promise<any> {

    return await GraphModel.findAll().EdgeModel.findAll({
        where: {
            graph_id: id,
        }
    });

};