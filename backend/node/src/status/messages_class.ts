import { CustomStatusCodes } from './status_codes';
import { MessageInterface } from './messages_interface';
import { Response } from "express";

/**
 * Implementazione delle interfacce per la gestione dei messaggi di stato
 * Imposta il messaggio di stato sulla risposta HTTP con il codice di stato corrispondente.
 */

export class BadRequestMessage implements MessageInterface {
    public setStatus(res: Response, messageType: string): any {
        res.status(CustomStatusCodes.BAD_REQUEST).json({
            BAD_REQUEST: messageType
        });
    };
}

export class UnauthorizedMessage implements MessageInterface {
    public setStatus(res: Response, messageType: string): any {
        res.status(CustomStatusCodes.UNAUTHORIZED).json({
            UNAUTHORIZED: messageType
        });
    };
}

export class InternalServerErrorMessage implements MessageInterface {
    public setStatus(res: Response, messageType: string): any {
        res.status(CustomStatusCodes.INTERNAL_SERVER_ERROR).json({
            INTERNAL_SERVER_ERROR: messageType
        });
    };
}

export class NotFoundErrorMessage implements MessageInterface {
    public setStatus(res: Response, messageType: string): any {
        res.status(CustomStatusCodes.NOT_FOUND).json({
            NOT_FOUND: messageType
        });
    };
}

export class OkMessage implements MessageInterface {
    public setStatus(res: Response, messageType: string): any {
        res.status(CustomStatusCodes.OK).json({
            OK: messageType
        });
    };
}