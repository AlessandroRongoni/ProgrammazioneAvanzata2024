export enum CustomStatusCodes {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    OK = 200
}

export enum Messages200 {
    ModelCreationSuccess = "Modello creato con successo.",
    ModelUpdateSuccess = "Modello aggiornato con successo.",
    UpdateNotification = "Richiesta di aggiornamento inviata con successo.",
    WeightUpdateApprovalSuccess = "Richiesta di aggiornamento dei pesi accettata con successo.",
    WeightUpdateRejectionSuccess = "Richiesta di aggiornamento dei pesi rifiutata con successo.",
    ModelExecutionSuccess = "Modello eseguito con successo.",
    JwtCreated = "Jwt creato correttamente!",
    UserCreateSuccess = "Utente creato con successo.",
    RefillDoneSuccess = "Ok, i token sono stati distribuiti con successo.",
    PdfSuccess = "File PDF scaricato con successo.",
    RequestAwnsered = "Richieste risposte con successo."
}
export enum Messages300 {

}
export enum Messages400 {
    NoAuthHeader = "Bad Request - No authorization header",
    NoTokenJWT = "Bad Request - No JWT",
    InvalidTokenJWT = "Forbidden - Invalid JWT (the key is incorrect)",
    UpdateRequired = "Il valore dell'UpdateId deve essere specificato e diverso da 0",
    UnauthorizedUser = "Non è possibile creare l\'utente perchè è già esistente",
    Unauthorized = "Questo utente non ha le autorizzazioni necessarie a svolgere l\'operazione", //quando uno user prova a fare refillToken
    UserNotFound = "Non è possibile trovare l\'utente specificato",
    GraphNotFound = "Non è possibile trovare il grafo specificato",
    EdgeNotFound = "Non è possibile trovare l'arco specificato",
    GraphValidation = "La struttura del grafo non è valida",
    WeightValidation = "Nuovo peso inserito non valido",
    EdgeNotInn = "L'arco non appartiene al grafo",
    NoNodes = "Deve essere presente ALMENO un nodo",
    NoEdges = "Devono essere presenti anche gli archi",
    NoTokens = "Tokens insufficienti per creare il grafo, contattare l\'admin",
    InvalidToken = "I Token inseriti devono essere dei valori double compresi tra 0 e 1000",
    EmailCheck = "Il formato dell'email inserita non è corretto",
    PasswordCheck = "La password deve contenere almeno 8 caratteri ed un numero, un carattere speciale, un carattere maiuscolo e uno minuscolo",
    SameUser = "Non puoi creare lo stesso utente più volte",
    NoDate = "Non hai inserito la data di inizio o di fine",
    InvalidDateSame = "La data di inizio non può coincidere con quella di fine",
    InvalidDate = "La data di fine deve precedere quella di inizio",
    NegativeTokens = "Non puoi inserire un numero di token negativo",
    NotANumber = "Il valore inserito deve essere numerico",
    IsANumber = "Il valore inserito non deve essere numerico",
    EmailEmpty = "L\'email non può essere vuota",
    PasswordEmpty = "La password non può essere vuota",
    TokensEmpty = "Il valore dei token non può essere vuoto",
    InvalidDateFormat = "Le date sono state inserite in maniera errata",
    UpdateRequestNotFound = "Non ci sono richieste per te.",
    UpdateNotFound = "Non ci sono update con questo ID.",
    UpdateAlreadyAwnsered = "Non puoi modificare un update a cui già hai risposto.",
    UpdateRequestNotFoundForModel = "Non ci sono richieste per il grafo specificato.",
    NoStoric = "Non c'è uno storico di richieste per te.",
    AllRequestAlreadyAwnsered = "Non ci sono richieste di aggiornamento pendenti per te.",
    NotOwner = "Non sei il proprietario del grafo",
    WeightIsRequired= "Il peso dell'arco è obbligatorio",
    NoTokensUpdate = "Non hai abbastanza tokens per fare l'upgrade",
    PasswordNotMatch = "La password inserita non corrisponde a quella nel DB.",
    UpdateNotDifferent = "Non puoi accettare o rifiutare la stessa richiesta di aggiornamento.",
    NoUpdates = "Non ci sono aggiornamenti per questo grafo.",
    UpdateAnswerValidation = "La risposta deve essere true o false."
}

export enum Messages500 {
    ImpossibileCreation = "Non è possibile creare il grafo.",
    InternalServerError = "Errore interno al server.",
    PdfUnable = "Impossibile generare file pdf."

}