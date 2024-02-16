import { findAllUsers, findUser } from "../db/queries/user_queries";
import { MessageFactory } from '../status/messages_factory'
import { CustomStatusCodes, Messages400 } from '../status/status_codes'
import { Response } from "express";

let statusMessage: MessageFactory = new MessageFactory();

/**
 * Verifica se l'utente esiste nel sistema.
 * @param email - L'indirizzo email dell'utente da verificare.
 * @param res - L'oggetto di risposta HTTP utilizzato per inviare la risposta al client.
 * @param isPresent - Flag che indica se l'utente è presente o meno nel sistema.
 * @returns Una Promise che restituisce true se l'utente è presente, altrimenti false.
 */
export async function verifyIsUser(email: string, res: Response, isPresent: Boolean) {
    let existing = await findUser(email);
    if (existing.length == 0) {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        isPresent = false;
    }
    return isPresent;
}


