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
    getStatusMessage(cases: CustomStatusCodes, res: Response, message: string): any {
        let oneCase = cases;
        let messageClass;
        switch (oneCase) {
            case (400):
                messageClass = new BadRequestMessage();
                return messageClass.setStatus(res, message);
            case (401):
                messageClass = new UnauthorizedMessage();
                return messageClass.setStatus(res, message);
            case (500):
                messageClass = new InternalServerErrorMessage();
                return messageClass.setStatus(res, message);
            case (404):
                messageClass = new NotFoundErrorMessage();
                return messageClass.setStatus(res, message);
            case (200):
                messageClass = new OkMessage();
                return messageClass.setStatus(res, message);
            default:
                return res.status(CustomStatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages500.InternalServerError });
        }

    }
}