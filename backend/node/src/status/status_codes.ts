export enum CustomStatusCodes {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    OK = 200,
}

export enum Messages200 {
    UserWin = "Game Over, hai vinto",
    AiWin = "Game Over, AI ha vinto",
    Win = "Hai vinto!",
    Hit = "Colpito!",
    Flop = "Acqua!",
    JwtCreated = "Jwt creato correttamente!",
    UserCreateSuccess = "Utente creato con successo",
    PdfSuccess = "File PDF scaricato con successo."


}
export enum Messages300 {

}
export enum Messages400 {
    UnauthorizedUser = "Non è possibile creare l\'utente perchè è già esistente",
    Unauthorized = "Questo utente non ha le autorizzazioni necessarie a svolgere l\'operazione",
    NoTokens = "Tokens insufficienti per creare il game, contattare l\'amministratore",
    UserNotFound = "Non è possibile trovare l\'utente specificato",
    GameNotFound = "Non è possibile trovare il game specificato",
    MoveUnauthorized = "Non puoi eseguire questa mossa, è presente la tua nave",
    MoveAlreadyDone = "Mossa già eseguita",
    NotYourTurn = "Non puoi eseguire questa mossa, non è il tuo turno",
    GameIsEnded = "La partita è già terminata",
    EmailCheck = "Il formato dell'email inserita non è corretto",
    PasswordCheck = "La password deve contenere almeno 8 caratteri ed un numero, un carattere speciale, un carattere maiuscolo e uno minuscolo",
    SameUser = "Non puoi inserire lo stesso utente più volte nello stesso game",
    UserNotAvailable = "Uno o più utenti stanno già giocando in un altro game",
    CreatorNotAvailable = "Non puoi creare un game, sei già impegnato in un altro game",
    StatsNotAvalaible = "Statische non disponibili",
    InvalidDateSame = "La data di inizio non può coincidere con quella di fine",
    InvalidDate = "La data di fine deve precedere quella di inizio",
    NegativeTokens = "Non puoi inserire un numero di token negativo",
    NotANumber = "Il valore inserito deve essere numerico",
    IsANumber = "Il valore inserito non deve essere numerico",
    OutOfBound = "L'indice della mossa non può eccedere la dimensione della griglia",
    OutInvalid = "L'indice della mossa non può essere negativo",
    TypeInvalid = "Type deve essere ascendente o discendente",
    EmailEmpty = "L\'email non può essere vuota",
    PasswordEmpty = "La password non può essere vuota",
    TokensEmpty = "Il valore dei token non può essere vuoto",
    InvalidDateFormat = "Le date sono state inserite in maniera errata",
    MalformedNumber = "Il formato del numero delle navi non è corretto",
    MalformedArray = "Formato del campo ships non corretto",
    MalformedFields = "Il formato dell'inserimento delle navi contiene campi errati",
    MalformedSize = "Il formato dell'inserimento delle navi non è corretto"
}

export enum Messages500 {
    ImpossibileCreation = "Non è possibile creare il game",
    InternalServerError = "Errore interno al server",
    PdfUnable = "Impossibile generare file pdf"

}