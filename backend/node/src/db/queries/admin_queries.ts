import { UserModel } from '../../models/UserModel';
/**
 * Aggiorna il numero di token di un utente nel database.
 * Aggiorna il campo "tokens" dell'utente identificato dall'indirizzo email nel database.
 *
 * @param tokens - Il nuovo numero di token da assegnare all'utente.
 * @param email - L'indirizzo email dell'utente da aggiornare.
 * @returns Restituisce i dettagli dell'utente aggiornato nel database.
 */
export async function updateUserTokensDb(tokens: number, email: string): Promise<any> {
    return await UserModel.update({ tokens: tokens }, {
        where: {
            email: email
        }
    });
};