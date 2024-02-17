var jwt = require('jsonwebtoken');
import { Request, Response } from "express";

/**
 * Decodifica un token JWT.
 * 
 * @param auth - La stringa di autorizzazione contenente il token JWT.
 * @returns L'oggetto decodificato del token JWT.
 */
export function decodeJwt(auth: any) {
    const token = auth.split(" ")[1]
    return jwt.verify(token, process.env.PRIVATE_KEY);
}


/**
 * Ottiene l'email dall'oggetto di richiesta utilizzando il token JWT.
 * 
 * @param req - L'oggetto di richiesta HTTP.
 * @returns L'email estratta dal token JWT come stringa.
 */
export function getJwtEmail(req: Request): string {
    let jwtBearerToken = req.headers.authorization;
    let jwtDecode = jwtBearerToken ? decodeJwt(jwtBearerToken) : null;
    let jwtUserEmail: any;
    jwtUserEmail = jwtDecode.email;
    return jwtUserEmail;
}

