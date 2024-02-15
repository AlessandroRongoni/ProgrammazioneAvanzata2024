export enum CustomStatusCodes {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    OK = 200,
}

export enum Messages200 {
    ModelCreationSuccess = "Modello creato con successo",
    ModelUpdateSuccess = "Modello aggiornato con successo",
    WeightUpdateApprovalSuccess = "Richiesta di aggiornamento dei pesi accettata con successo",
    WeightUpdateRejectionSuccess = "Richiesta di aggiornamento dei pesi rifiutata con successo",
    ModelExecutionSuccess = "Modello eseguito con successo",
    JwtCreated = "Jwt creato correttamente!",
    UserCreateSuccess = "Utente creato con successo",
    RefillDoneSuccess = "Ok, i token sono stati distribuiti con successo",
    PdfSuccess = "File PDF scaricato con successo."


}
export enum Messages300 {

}
export enum Messages400 {
    NoAuthHeader = "Bad Request - No authorization header",
    NoTokenJWT = "Bad Request - No JWT",
    InvalidTokenJWT = "Forbidden - Invalid JWT (the key is incorrect)",
    UnauthorizedUser = "Non è possibile creare l\'utente perchè è già esistente",
    Unauthorized = "Questo utente non ha le autorizzazioni necessarie a svolgere l\'operazione", //quando uno user prova a fare refillToken
    UserNotFound = "Non è possibile trovare l\'utente specificato",
    GraphNotFound = "Non è possibile trovare il grafo specificato",
    GraphValidation = "La struttura del grafo non è valida",
    WeightValidation = "Nuovo peso inserito non valido",
    NoTokens = "Tokens insufficienti per creare il grafo, contattare l\'admin",
    InvalidToken = "I Token inseriti devono essere dei valori double compresi tra 0 e 1000",
    EmailCheck = "Il formato dell'email inserita non è corretto",
    PasswordCheck = "La password deve contenere almeno 8 caratteri ed un numero, un carattere speciale, un carattere maiuscolo e uno minuscolo",
    SameUser = "Non puoi creare lo stesso utente più volte",
    InvalidDateSame = "La data di inizio non può coincidere con quella di fine",
    InvalidDate = "La data di fine deve precedere quella di inizio",
    NegativeTokens = "Non puoi inserire un numero di token negativo",
    NotANumber = "Il valore inserito deve essere numerico",
    IsANumber = "Il valore inserito non deve essere numerico",
    EmailEmpty = "L\'email non può essere vuota",
    PasswordEmpty = "La password non può essere vuota",
    TokensEmpty = "Il valore dei token non può essere vuoto",
    InvalidDateFormat = "Le date sono state inserite in maniera errata",
}

export enum Messages500 {
    ImpossibileCreation = "Non è possibile creare il grafo",
    InternalServerError = "Errore interno al server",
    PdfUnable = "Impossibile generare file pdf"

}