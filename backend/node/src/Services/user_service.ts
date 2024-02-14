import { findUser, createUserDb, findAllUsers } from '../db/queries/user_queries';
import { Request, Response } from "express";
import { MessageFactory } from '../status/messages_factory'
import { CustomStatusCodes, Messages200, Messages400, Messages500 } from '../status/status_codes'
import { updateUserTokensDb } from '../db/queries/admin_queries';
import { getJwtEmail } from './jwt_service';
import { verifyIsUser, verifyDifferentUser, verifyIsPlaying } from '../utils/user_utils';

let statusMessage: MessageFactory = new MessageFactory();

/**
 * Ottiene tutti gli utenti nel database e restituisce una risposta con l'elenco degli utenti.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function getAllUsersService(res: Response) {
    try {
        const users: any = await findAllUsers();
        let message = JSON.parse(JSON.stringify({ users: users }));
        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);

    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

/**
 * Crea un nuovo utente nel database in base alla richiesta e restituisce una risposta di successo.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function createUserService(req: Request, res: Response) {
    try {
        const user: any = await findUser(req.body.email);
        if (user.length == 0) {
            await createUserDb(req);
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, Messages200.UserCreateSuccess);
        }
        else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnauthorizedUser);
        };
    } catch (e) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

/**
 * Ottiene i token di un utente dal database in base alla richiesta e restituisce una risposta con il numero di token.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function getTokensService(req: Request, res: Response) {
    try {
        let jwtPlayerEmail = getJwtEmail(req);
        const user: any = await findUser(jwtPlayerEmail);
        if (user.length != 0) {
            const tokens = parseFloat(user[0].dataValues.tokens);
            let message = JSON.parse(JSON.stringify({ tokens: tokens }))
            statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.InternalServerError);
    }
}

/**
 * Crea una nuova partita nel servizio di gioco.
 * @param req - L'oggetto di richiesta HTTP.
 * @param res - L'oggetto di risposta HTTP.
 */
export async function createGameService(req: Request, res: Response) {

    // Ottiene l'indirizzo email dell'utente dal token JWT

    let jwtPlayerEmail = getJwtEmail(req);

    // Ottiene le informazioni sulla dimensione della griglia e sulle navi dalla richiesta

    let gridSize = req.body.grid_size;
    let size1ShipsReq = req.body.ships[0].size1;
    let size2ShipsReq = req.body.ships[1].size2
    let size3ShipsReq = req.body.ships[2].size3

    // Variabili per il numero massimo di parti di nave consentite per ogni dimensione di nave

    let maxShipPiecesOne: number = 0;
    let maxShipPiecesTwo: number = 0;
    let maxShipPiecesThree: number = 0;

    // Imposta il numero massimo di parti di nave consentite in base alla dimensione della griglia

    switch (true) {
        case (gridSize == 5): { maxShipPiecesOne = 0; maxShipPiecesTwo = 1; maxShipPiecesThree = 0; break; }
        case (gridSize == 6): { maxShipPiecesOne = 1; maxShipPiecesTwo = 1; maxShipPiecesThree = 0; break; }
        case (gridSize == 7): { maxShipPiecesOne = 1; maxShipPiecesTwo = 1; maxShipPiecesThree = 1; break; }
        case (gridSize == 8): { maxShipPiecesOne = 2; maxShipPiecesTwo = 1; maxShipPiecesThree = 1; break; }
        case (gridSize == 9): { maxShipPiecesOne = 2; maxShipPiecesTwo = 2; maxShipPiecesThree = 1; break; }
        case (gridSize == 10): { maxShipPiecesOne = 3; maxShipPiecesTwo = 2; maxShipPiecesThree = 1; break; }
    }
    try {

        // Verifica se esiste già una partita con lo stesso nome

        let game = await findGame(req.body.name);
        if (game.length !== 0) {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.GameAlreadyExists);
        } else {

            // Trova l'utente creatore della partita

            let userCreator = await findUser(jwtPlayerEmail);

            // Ottiene il numero di token corrente dell'utente creatore

            let currentTokens = parseFloat(userCreator[0].dataValues.tokens)

            // Verifica se il numero di navi richieste supera il limite consentito per ogni dimensione di nave

            if (size1ShipsReq > maxShipPiecesOne || size2ShipsReq > maxShipPiecesTwo || size3ShipsReq > maxShipPiecesThree) {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.OutOfBoundShips);
            } else if (userCreator && currentTokens < 0.45) {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.NoTokens);
            } else {
                let possibleMoves = setShips(req.body.grid_size, req, jwtPlayerEmail);
                let player1 = req.body.player1;
                let player2 = req.body.player2;
                let mod: string;
                let event: number;
                let isPresent: Boolean = true;
                let isDifferent: Boolean = true;
                let isCreator: Boolean = true;
                let arePlaying: Boolean = false;
                let isPlayingCreator = await verifyIsPlaying(jwtPlayerEmail, res, isCreator)

                if (!isPlayingCreator) {

                    // Verifica quali campi player sono specificati e setta la modalità

                    if (player1 !== "" && player2 !== "") {
                        isDifferent = await verifyDifferentUser(jwtPlayerEmail, player1, res, isDifferent) && await verifyDifferentUser(jwtPlayerEmail, player2, res, isDifferent)
                            && await verifyDifferentUser(player1, player2, res, isDifferent);
                        isPresent = await verifyIsUser(player1, res, isPresent) && await verifyIsUser(player2, res, isPresent);
                        arePlaying = await verifyIsPlaying(player1, res, !isCreator) && await verifyIsPlaying(player2, res, !isCreator);
                        mod = GameMode.mode3;
                        event = 1;
                    } else if (player1 !== "" && player2 == "") {
                        isDifferent = await verifyDifferentUser(jwtPlayerEmail, player1, res, isDifferent);
                        isPresent = await verifyIsUser(player1, res, isPresent);
                        arePlaying = await verifyIsPlaying(player1, res, !isCreator);
                        mod = GameMode.mode2;
                        event = 2;
                    } else if (player1 == "" && player2 !== "") {
                        isDifferent = await verifyDifferentUser(jwtPlayerEmail, player2, res, isDifferent);
                        isPresent = await verifyIsUser(player2, res, isPresent);
                        arePlaying = await verifyIsPlaying(player2, res, !isCreator);
                        mod = GameMode.mode2;
                        event = 3;
                    } else {
                        mod = GameMode.mode1;
                        event = 4;
                    }

                    if (isPresent && isDifferent && !arePlaying) {

                        let updatedTokens = currentTokens - 0.45;
                        await updateUserTokensDb(updatedTokens, jwtPlayerEmail);

                        // Imposta lo stato "isPlaying" dell'utente specifico a true

                        await setIsPlayingDb(jwtPlayerEmail);
                        if (event === 1) {
                            await setIsPlayingDb(player1);
                            await setIsPlayingDb(player2);
                        } else if (event === 2) {
                            await setIsPlayingDb(player1);
                        } else if (event === 3) {
                            await setIsPlayingDb(player2);
                        }

                        if (player1 == "" && player2 != "") {
                            player1 = player2;
                            player2 = "";
                        }

                        // Crea la nuova partita nel database

                        const newGame: any = await createGameDb(req, possibleMoves, mod, jwtPlayerEmail, player1, player2);

                        let message = JSON.parse(JSON.stringify({ game: newGame }));
                        statusMessage.getStatusMessage(CustomStatusCodes.OK, res, message);
                    }
                }
                else {
                    statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.CreatorNotAvailable)
                }
            }
        }
    } catch (error) {
        statusMessage.getStatusMessage(CustomStatusCodes.INTERNAL_SERVER_ERROR, res, Messages500.ImpossibileCreation);
    }

}