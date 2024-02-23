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
/**
 * Enumerazione dei messaggi di errore per la risposta HTTP 400.
 */
export enum Messages400 {
    NoAuthHeader = "Bad Request - No authorization header",
    UnconnectedNodes = "Nodi non connessi",
    NoTokenJWT = "Bad Request - No JWT",
    InvalidTokenJWT = "Forbidden - Invalid JWT (the key is incorrect).",
    UpdateRequired = "Il valore dell'UpdateId deve essere specificato e diverso da 0.",
    NotReciprocal = "Gli archi non devono essere reciproci.",
    UnauthorizedUser = "Non è possibile creare l\'utente perchè è già esistente.",
    Unauthorized = "Questo utente non ha le autorizzazioni necessarie a svolgere l\'operazione.", //quando uno user prova a fare refillToken
    UserNotFound = "Non è possibile trovare l\'utente specificato.",
    GraphNotFound = "Non è possibile trovare il grafo specificato.",
    EdgeNotFound = "Non è possibile trovare l'arco specificato.",
    NodeNotFound = "Il nodo di partenza o di arrivo non esiste/esistono.",
    PathNotFound = "Percorso non trovato.",
    GraphValidation = "La struttura del grafo non è valida.",
    WeightValidation = "Peso inserito non valido.",
    EdgeNotInn = "L'arco non appartiene al grafo.",
    NoNodes = "Devono essere presenti ALMENO due nodi.",
    NoEdges = "Devono essere presenti anche gli archi.",
    NoUpdateForGraph = "Non ci sono update per questo grafo.",
    InvalidGraphId = "l'id del grafo inserito deve essere un numero, non una stringa!",
    NoTokens = "Tokens insufficienti per creare il grafo, contattare l\'admin",
    InvalidToken = "I Token inseriti devono essere dei valori double compresi tra 0 e 1000",
    InvalidNodes = "Il valore del nodo deve essere una stringa",
    InvalidSimulationValue = "I parametri di simulazione devono essere numeri.",
    InvalidSimulationReverse = "La data di fine deve precedere quella di inizio.",
    NegativeOrNullStep = "Lo step deve essere un numero positivo e mai uguale a zero.",
    UnsupportedFormat = " Il formato inserito non è supportato, perfavore inserisci: pdf, xml, csv o json.",
    EmailCheck = "Il formato dell'email inserita non è corretto.",
    PasswordCheck = "La password deve contenere almeno 8 caratteri ed un numero, un carattere speciale, un carattere maiuscolo o minuscolo.",
    SameUser = "Non puoi creare lo stesso utente più volte.",
    DateString = "La data deve essere una stringa.",
    InvalidDate = "Il formato della/delle data/e non è nel formato corretto.",
    InvalidDateReverse = "La data di fine deve precedere quella di inizio.",
    StatusString = "Lo stato deve essere una stringa.",
    AllowStatus= "Gli unici valori accettati sono 'accepted' 'rejected' o la stringa vuota.",
    NegativeTokens = "Non puoi inserire un numero di token negativ.",
    NotANumber = "Il valore inserito deve essere numerico.",
    IsANumber = "Il valore inserito non deve essere numerico.",
    FormatString = "Il formato deve essere una stringa.",
    EmailEmpty = "L\'email non può essere vuota.",
    PasswordEmpty = "La password non può essere vuota.",
    TokensEmpty = "Il valore dei token non può essere vuoto.",
    InvalidDateFormat = "Le date sono state inserite in maniera errata.",
    UpdateRequestNotFound = "Non ci sono richieste per te.",
    UpdateNotFound = "Non ci sono update con questo ID.",
    UpdateAlreadyAwnsered = "Non puoi modificare un update a cui già hai risposto.",
    UpdateRequestNotFoundForModel = "Non ci sono richieste per il grafo specificato.",
    NoStoric = "Non c'è uno storico di richieste per te.",
    AllRequestAlreadyAwnsered = "Non ci sono richieste di aggiornamento pendenti per te.",
    NotOwner = "Non sei il proprietario del grafo.",
    WeightIsRequired= "Il peso dell'arco è obbligatorio.",
    NoTokensUpdate = "Non hai abbastanza tokens per fare l'upgrade.",
    PasswordNotMatch = "La password inserita non corrisponde a quella nel DB.",
    UpdateNotDifferent = "Non puoi accettare o rifiutare la stessa richiesta di aggiornamento.",
    NoUpdates = "Non ci sono aggiornamenti per questo grafo.",
    UpdateAnswerValidation = "La risposta deve essere true o false.",
    RequestNotFound = "Body non valido, inserisci almeno l'ID Upgrade di una richiesta.",
    GraphNameNotUnique = "Esiste già un grafo con questo nome.",
    DescriptionValidation = "La descrizione non può essere più lunga di 150 caratteri.",
    DuplicateEdges = "Non puoi inserire archi duplicati.",
    DuplicateNodes = "Non puoi inserire nodi duplicati.",
    NotACorrectNodes = "Il valore inserito nei nodi deve essere una stringa e non può essere vuoto.",
    NotCorrispondingNodes = "Non puoi inserire archi con nodi non presenti nel grafo.",
    NameValidaton = "Il nome non può essere più lungo di 50 caratteri e più corto di un carattere.",
    BadFormat= "Il formato del body non è corretto. Controlla bene i dati inseriti.",
    NotACorrectEdge = "Il valore inserito deve essere una stringa e non può essere vuoto. Inoltre, nodo di partenza e quello di arrivo non possono avere lo stesso nome.",
    NoGraphName = "Il nome del grafo è richiesto e non può essere vuoto.",
    GraphLengthLimit = "Il nome del grafo non può superare i 50 caratteri.",
    DescriptionString = "La descrizione deve essere una stringa.",
    DescriptionLenghtLimit = "La descrizione non può superare i 150 caratteri.",
    NodeArray = "L'array dei nodi non può essere vuoto.",
    DuplicateNode = "Sono stati rilevati nodi duplicati nell'array dei nodi.",
    EdgeArray = "Gli archi devono essere forniti in un array non vuoto.",
    StardEndNodeCoincide = "Lo startNode non può coincidere con l'endNode."

    

}

export enum Messages500 {
    ImpossibileCreation = "Non è possibile creare il grafo.",
    InternalServerError = "Errore interno al server.",
    Unable = "Impossibile generare file pdf/csv/xml/JSON.",
    ErrorSimulation = "Errore durante la simulazione."

}