import { CustomStatusCodes, Messages500 } from './status_codes';
import { Response } from "express";
import { BadRequestMessage, InternalServerErrorMessage, NotFoundErrorMessage, OkMessage, UnauthorizedMessage } from './messages_class';

/**
 * Factory per la generazione di messaggi di stato in base al codice di stato personalizzato.
 */
export class MessageFactory {
    constructor() { };

    /**
     * Restituisce un oggetto di messaggio di stato in base al codice di stato fornito.
     * 
     * @param cases - Il codice di stato personalizzato.
     * @param res - L'oggetto di risposta HTTP utilizzato per inviare la risposta al client.
     * @param message - Il messaggio da impostare sulla risposta HTTP.
     * @returns L'oggetto di messaggio di stato corrispondente.
     */
    static getStatusMessage(cases: CustomStatusCodes, res: Response, message: string) {
        switch (cases) {
            case CustomStatusCodes.BAD_REQUEST:
                return BadRequestMessage.setStatus(res, message);
            case CustomStatusCodes.UNAUTHORIZED:
                return UnauthorizedMessage.setStatus(res, message);
            case CustomStatusCodes.INTERNAL_SERVER_ERROR:
                return InternalServerErrorMessage.setStatus(res, message);
            case CustomStatusCodes.NOT_FOUND:
                return NotFoundErrorMessage.setStatus(res, message);
            case CustomStatusCodes.OK:
                return OkMessage.setStatus(res, message);
            default:
                return res.status(CustomStatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages500.InternalServerError });
        }
    }
}