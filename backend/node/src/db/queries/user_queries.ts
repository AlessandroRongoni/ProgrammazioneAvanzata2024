import { UserModel } from '../../models/UserModel';
import { Request } from "express";

const time: number = Date.now();

/**
 * Trova un utente nel database in base all'indirizzo email specificato.
 *
 * @param email - L'indirizzo email dell'utente da cercare nel database.
 * @returns Restituisce i dettagli dell'utente trovato.
 */
export async function findUser(email: string): Promise<any> {

    return await UserModel.findAll({
        where: {
            email: email,
        }
    });

};

/**
 * Trova tutti gli utenti nel database.
 *
 * @returns Restituisce tutti gli utenti trovati nel database.
 */
export async function findAllUsers(): Promise<any> {

    return await UserModel.findAll();

};


/**
 * Crea un nuovo utente nel database con i dettagli forniti nella richiesta.
 *
 * @param req - La richiesta contenente i dettagli dell'utente da creare.
 * @returns Restituisce l'utente creato.
 */
export async function createUserDb(req: Request): Promise<any> {

    return await UserModel.create({
        email: req.body.email,
        password: req.body.password,
        tokens: 100.0,
        isadmin: false
    });

};
