import { Response } from "express";

/**
 * Interface per la generazione di messaggi personalizzati.
 */
export interface MessageInterface {
    setStatus(res: Response, msg: string): any;
}

