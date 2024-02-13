// src/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  status: 'error';
  message: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Logga l'errore per il debugging

  let customError: ErrorResponse = {
    status: 'error',
    message: 'Si è verificato un errore sconosciuto', // Messaggio di default
  };

  // Gestione degli errori di Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    customError.message = err.errors.map((e: any) => e.message).join('; ');
    res.status(400).json(customError);
    return;
  }

  // Gestione degli errori di autenticazione
  if (err.name === 'UnauthorizedError') {
    customError.message = 'Accesso non autorizzato';
    res.status(401).json(customError);
    return;
  }

  // Altri tipi di errori possono essere gestiti qui

  // Invia la risposta di errore
  res.status(err.statusCode || 500).json(customError);
};

export default errorHandler;
