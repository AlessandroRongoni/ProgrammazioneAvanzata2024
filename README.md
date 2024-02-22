<div align="center">

<img src="https://raw.githubusercontent.com/AlessandroRongoni/ProgrammazioneAvanzata2024/main/img/Grafo.webp" width="300">

[![Postgres](https://img.shields.io/badge/Made%20with-postgres-%23316192.svg?style=plastic&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NPM](https://img.shields.io/badge/Made%20with-NPM-%23CB3837.svg?style=plastic&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![NodeJS](https://img.shields.io/badge/Made%20with-node.js-6DA55F?style=plastic&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Express.js](https://img.shields.io/badge/Made%20with-express.js-%23404d59.svg?style=plastic&logo=express&logoColor=%2361DAFB)](https://expressjs.com/it/)
[![JWT](https://img.shields.io/badge/Made%20with-JWT-black?style=plastic&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Visual Studio Code](https://img.shields.io/badge/Made%20with-Visual%20Studio%20Code-0078d7.svg?style=plastic&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/Made%20with-typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sequelize](https://img.shields.io/badge/Made%20with-Sequelize-52B0E7?style=plastic&logo=Sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Made%20with-docker-%230db7ed.svg?style=plastic&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postman](https://img.shields.io/badge/Made%20with-Postman-FF6C37?style=plastic&logo=postman&logoColor=white)](https://www.postman.com/)

</div>

## Indice

- [Obiettivi del Progetto](#obiettivi-del-progetto)
- [Progettazione](#progettazione)
- [Funzionamento](#funzionamento)
- [Testing](#testing)
- [Autori](#autori)

## Obiettivi del Progetto
#### Descrizione del progetto:
Le specifiche del progetto sono state fornite dal professore [*Adriano Mancini*](https://github.com/manciniadriano):

*Si realizzi un sistema che consenta di gestire la creazione e valutazione di modelli di ottimizzazione su grafo. In particolare, il sistema deve prevedere la possibilità di gestire l’aggiornamento di pesi effettuato da utenti autenticati (mediante JWT). Il progetto simula il concetto del crowd-sourcing dove gli utenti possono contribuire attivamente. Un esempio di applicazione è quello di tenere traccia dei minuti che sono necessari per percorre un determinato tratto di strada. Di seguito il dettaglio di quanto si deve realizzare (tutte le chiamate devono essere autenticate con JWT):*

- *Dare la possibilità di creare un nuovo modello seguendo l’interfaccia definita nella sezione API di [node-dijkstra](https://www.npmjs.com/package/node-dijkstra) ed in particolare di specificare il grafo con i relativi pesi.*
  - *È necessario validare la richiesta di creazione del modello.*
  - *Per ogni modello valido deve essere addebitato un numero di token in accordo con quanto segue:*
    - *0.10 per ogni nodo.*
    - *0.02 per ogni arco.*
  - *Il modello può essere creato se c’è credito sufficiente adesaudire la richiesta.*

- *Dare la possibilità di aggiornare un modello cambiando il peso per uno o più archi; si distinguano due casi:*
  - *Utente che fa richiesta di aggiornamento che coincide con l’utente che ha creato il modello.*
    - *In questo caso la richiesta se valida consente di avere una versione differente dall’ultima utilizzata.*
  - *Utente che fa richiesta di aggiornamento che NON coincide con l’utente che ha creato il modello.*
    - *In questo caso la richiesta deve essere approvata o rifiutata dall’utente che ha creato il modello.*
    - *Creare una rotta per approvare o rigettare una data richiesta di aggiornamento.*
  - *La richiesta di aggiornamento costa 0.025 per ogni arco che si vuole aggiornare; rifiutare se il credito non è sufficiente. L’importo viene sottratto all’utente che sta facendo la richiesta.*

- *Per ogni nuova richiesta approvata si proceda con aggiornare il peso dell’arco mediante una media esponenziale del tipo **p(i,j) = alpha * p(i,j) + (1 – alpha) * p_new(i,j)** dove **p(i,j)** è il precedente costo associato all’arco che collega nodi i-j e **p_new** è il nuovo costo suggerito dall’utente. alpha è uguale per tutti i modelli e deve essere gestito mediante una variabile di env. alpha deve essere > 0 e < 1; valori errati nella variabile di env devono determinare l’avvio del sistema con una configurazione pari ad alpha = 0.8*

- *Creare una rotta che dato un modello consenta di restituire l’elenco degli aggiornamenti effettuati nel corso del tempo filtrando opzionalmente per data (inferiore a, superiore a, compresa tra) distinguendo per stato ovvero accettato / rigettato.*

- *Creare una rotta che consenta di verificare lo stato di un modello ovvero se vi è una richiesta in fase di pending.*

- *Creare una rotta che consenta di visualizzare tutte le richieste di aggiornamento che sono in fase pending relative a modelli creati dall’utente che si autentica mediante token JWT.*

- *Creare una rotta che consenta di approvare / rigettare la richiesta di aggiornamento peso; solo l’utente che ha creato il modello può effettuare tale operazione (l’operazione può essere fatta anche in modalità bulk specificando quali richieste approvare o meno).*

- *Eseguire un modello fornendo un nodo di partenza ed uno di arrivo; per ogni esecuzione deve essere applicato un costo pari a quello addebitato nella fase di creazione. Ritornare il risultato sotto forma di JSON. Il risultato deve anche considerare il tempo impiegato per l’esecuzione. Ritornare il percorso ed il costo associato a tale percorso (per costo si intende non i termini di token, ma in termini di percorso ottimo sul grafo considerando i pesi).*

- *Restituire l’elenco degli aggiornamenti in formato JSON, CSV, PDF o XML dei pesi di un dato modello eventualmente filtrando per data specificando o la data di fine, o la data di inizio o entrambe.*

- *Effettuare una “simulazione” che consenta di variare il peso relativo ad un arco specificando il valore di inizio, fine ed il passo di incremento (es. start = 1 stop = 2 e passo 0.05).*
  - *Le richieste di simulazione devono essere validate (es. range non ammissibili).*
  - *È necessario ritornare l’elenco di tutti i risultati; ritornare anche il best result con la relativa configurazione dei pesi che sono stati usati. Restituire i dati sotto forma di JSON o PDF. Le richieste devono essere validate.*

*Si chiede di sviluppare il codice possibilmente utilizzando TypeScript. Ogni utente autenticato (ovvero con JWT) ha un numero di token (valore iniziale impostato nel seed del database). Nel caso di token terminati ogni richiesta da parte dello stesso utente deve restituire 401 Unauthorized.*

*Prevedere una rotta per l’utente con ruolo admin che consenta di effettuare la ricarica per un utente fornendo la mail ed il nuovo “credito” (sempre mediante JWT). I token JWT devono contenere i dati essenziali.*

*Il numero residuo di token deve essere memorizzato nel db sopra citato. Si deve prevedere degli script di seed per inizializzare il sistema. Nella fase di dimostrazione (demo) è necessario prevedere almeno 2 modelli diversi con almeno due versioni con una complessità minima di 8 nodi e 16 archi.*

*Si chiede di utilizzare le funzionalità di middleware.*

*Si chiede di gestire eventuali errori mediante gli strati middleware sollevando le opportune eccezioni.*

*Si chiede di commentare opportunamente il codice.*



## Progettazione

### Diagrammi UML
![Use Cases](https://github.com/AlessandroRongoni/ProgrammazioneAvanzata2024/blob/main/img/UseCasesOPTI.drawio.png?raw=true)


## API Routes

| Metodo | Rotta                          | Parametri                                                                                       | Descrizione                                                                                             |
|--------|--------------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `GET`  | `/`                            | Nessuno                                                                                         | Pagina di benvenuto, invita a effettuare il login.                                                      |
| `POST` | `/login`                       | email, password                                                                                 | Effettua il login e restituisce il JWT associato all'utente.                                            |
| `POST` | `/register`                    | email, password                                                                                 | Registra un nuovo utente.                                                                               |
| `GET`  | `/user/tokens`                 | JWT nel header                                                                                  | Restituisce i token associati ad un utente.                                                             |
| `PUT`  | `/recharge`                    |  email, tokens                                                                   | Modifica i token di un utente.                                                                          |
| `POST` | `/graph`                       |  name, description, nodes, edges                                                 | Crea un nuovo grafo.                                                                                    |
| `GET`  | `/graph/calculatecost`         |  graphId, startNode, endNode                                                     | Calcola il percorso minimo tra due nodi di un grafo.                                                    |
| `GET`  | `/graphslist`                  | JWT nel header                                                                                  | Ottiene tutta la lista dei grafi.                                                                       |
| `GET`  | `/graph/edges`                 |  graphId                                                                         | Ottiene la lista degli archi di un grafo.                                                               |
| `GET`  | `/user/all`                    | JWT nel header                                                                                  | Ottiene tutti gli utenti (solo per admin).                                                              |
| `GET`  | `/updates/graph/pending`       |  graphId                                                                         | Visualizza gli aggiornamenti pendenti per un modello.                                                   |
| `GET`  | `/updates/user/pending`        | JWT nel header                                                                                  | Visualizza gli aggiornamenti pendenti per un utente.                                                    |
| `PUT`  | `/update/answer`               |  updateId, answer                                                                | Approva o rifiuta una richiesta di aggiornamento.                                                       |
| `PUT`  | `/update/edges`                |  graphId, edgeId, newWeight                                                      | Aggiorna uno o più archi di un grafo.                                                                   |
| `GET`  | `/updates/history/graph`       |  graphId, dateFilter (from, to), status                                          | Restituisce l’elenco degli aggiornamenti effettuati nel tempo, filtrati per data e stato.               |
| `GET`  | `/updates/format`              |  graphId, dateFilter (from, to), status, format                                  | Ottiene gli aggiornamenti in formato specificato, filtrati per data e stato.                            |
| `GET`  | `/simulate`                    |  graphId, edgeId, startNode, endNode, startWeight, endWeight, step                | Simula variazioni di peso su un arco di un grafo, validando i parametri di simulazione.                 |

 **Nota:** Tutte le rotte hanno bisogno dell'autenticazione tramite JWT tranne le rotte */login* e */register*. 
 
 La rotta */user/all* può essere utilizzata solo dall'admin.

 ### Pattern Utilizzati

#### MVC (Model-View-Controller) Pattern
Il pattern MVC è un paradigma di progettazione software che separa l'applicazione in tre componenti principali: Modello (gestisce i dati e le regole del business), Vista (presenta i dati all'utente), e Controller (interpreta i comandi dell'utente, facendo da ponte tra Modello e Vista). Nel nostro progetto, abbiamo adottato un approccio M(V)C, dove la Vista non è direttamente implementata considerando la natura del backend, focalizzandoci su Modello e Controller per gestire dati e logica applicativa.

#### Singleton Pattern
Il pattern Singleton assicura che una classe abbia solo una istanza e fornisce un punto di accesso globale a questa istanza. È stato utilizzato per gestire la connessione al database, garantendo che la connessione sia unica e facilmente accessibile.

```javascript
// Singleton per la connessione al database
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const dbUsername = process.env.PGUSER || 'postgres';
const dbPassword = process.env.PGPASSWORD;
const dbName = process.env.PGDATABASEE || 'mydb';
const dbHost = process.env.PGHOST || 'db';
export class DbConnector {
    private static instance: DbConnector;
    private sequelizer: any;
    private constructor() {
        this.sequelizer = new Sequelize(dbName, dbUsername, dbPassword, { host: dbHost, dialect: 'postgres', });
    }
    public static getConnection(): any {
        if (!DbConnector.instance) {
            DbConnector.instance = new DbConnector();
        }
        return DbConnector.instance.sequelizer;
    }
}
```
#### Factory Pattern

Il pattern Factory è utilizzato per creare oggetti senza esplicitare la classe concreta che sarà istanziata. Questo permette di migliorare la modularità del codice rendendolo più flessibile e mantenibile. Nel nostro progetto, il Factory Pattern è impiegato per generare messaggi di risposta personalizzati basati sul codice di stato, facilitando la gestione delle risposte HTTP in diverse situazioni.

```javascript
export class MessageFactory {
    constructor() { };

    static getStatusMessage(cases: CustomStatusCodes, res: Response, message: string) {
        switch (cases) {
            case CustomStatusCodes.BAD_REQUEST:
                return BadRequestMessage.setStatus(res, message);
            case CustomStatusCodes.UNAUTHORIZED:
                return UnauthorizedMessage.setStatus(res, message);
            case CustomStatusCodes.INTERNAL_SERVER_ERROR:
                return InternalServerErrorMessage.setStatus(res, message);
            case CustomStatusCodes.NOT_FOUND:
                return NotFoundErrorMessage.setStatus(res, message);
            case CustomStatusCodes.OK:
                return OkMessage.setStatus(res, message);
            default:
                return res.status(CustomStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    }
}
```

```javascript
/**
 * Implementazione delle interfacce per la gestione dei messaggi di stato
 * Imposta il messaggio di stato sulla risposta HTTP con il codice di stato corrispondente.
 */

// Esempio di classe di messaggio modificata
export class BadRequestMessage {
    static setStatus(res: Response, message: string) {
        res.status(CustomStatusCodes.BAD_REQUEST).json({ message });
    }
}

export class UnauthorizedMessage {
    static setStatus(res: Response, message: string) {
        res.status(CustomStatusCodes.UNAUTHORIZED).json({ message });
    }
}

/**
 * Classe che rappresenta un messaggio di errore interno del server.
 */
export class InternalServerErrorMessage {
    /**
     * Imposta lo stato della risposta e restituisce un oggetto JSON contenente il messaggio di errore.
     * @param res - L'oggetto Response per impostare lo stato e inviare la risposta.
     * @param message - Il messaggio di errore da includere nell'oggetto JSON.
     */
    static setStatus(res: Response, message: string) {
        res.status(CustomStatusCodes.INTERNAL_SERVER_ERROR).json({ message });
    }
}

export class NotFoundErrorMessage {
    static setStatus(res: Response, message: string) {
        res.status(CustomStatusCodes.NOT_FOUND).json({ message });
    }
}

export class OkMessage {
    static setStatus(res: Response, message: string) {
        res.status(CustomStatusCodes.OK).json({ message });
    }
}
```
#### Chain of Responsibility Pattern

Il Chain of Responsibility Pattern permette di passare una richiesta lungo una catena di handler, dove ciascuno può gestirla o passarla al successivo. Questo pattern è utile per ridurre il coupling tra mittenti e destinatari di una richiesta, permettendo a più oggetti di tentare l'elaborazione.

Nel nostro contesto, viene applicato per la verifica del JWT nelle richieste HTTP, dove diversi controlli possono essere eseguiti in sequenza:

```javascript
/**
 * Controlla la validità del token JWT nell'intestazione della richiesta.
 * Verifica se il token JWT è presente e decodificabile correttamente.
 * Restituisce un errore 401 se il token JWT è mancante o non valido.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione di callback per passare alla prossima operazione.
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    const jwtBearerToken = req.headers.authorization;
    const jwtDecode = jwtBearerToken ? decodeJwt(jwtBearerToken) : null;

    if (jwtDecode && jwtDecode.email && jwtDecode.password) {
        next();
    } else {
        return MessageFactory.getStatusMessage(CustomStatusCodes.UNAUTHORIZED, res, Messages400.Unauthorized);

    }
};
```


## Funzionamento
 
 In questa sezione, forniremo una descrizione dettagliata di ogni rotta che è stata creata. Saranno inclusi i parametri richiesti per ciascuna chiamata API, insieme a un diagramma delle sequenze per illustrare l'interazione tra i componenti del sistema. Questo approccio aiuterà a comprendere il flusso di dati e la logica dietro le operazioni eseguibili tramite l'API, offrendo anche dettagli sui risultati restituiti da ciascuna rotta.

 ### POST: /login

Per poter ottenere una risposta, il corpo delle richieste dovrà seguire il seguente modello:

```json
{
	"email":"alessandro@op.it",
	"password":"Opti2024!"
}
```
```mermaid

```

```json
{
    "message": {
        "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZXNzYW5kcm9Ab3AuaXQiLCJwYXNzd29yZCI6Ik9wdGkyMDI0ISIsImlhdCI6MTcwODYxNjQ0MX0.Cdb9DhwPj6QFbzB_STt7rbTpGA3hUP8XWFaQ32-_Qfk"
    }
}
```
## Testing

Per testare il progetto, è essenziale seguire una serie di passaggi che garantiscano la configurazione corretta dell'ambiente di sviluppo e l'esecuzione efficace dei test. Ecco una guida dettagliata:

1. **Scaricare il Progetto**: Utilizzare l'URL del repository Git per clonarlo o scaricare direttamente il file ZIP.
2. **Importare il Pacchetto Postman**: Nella cartella Postman del progetto, troverai un pacchetto di chiamate da importare in Postman per testare le API.
3. **Configurare il File `.env`**: Compila il file `.env` con i dati necessari seguendo come esempio il file `.env` fornito.
4. **Installare Docker**: Scaricare e installare Docker dal sito ufficiale per gestire i container necessari al progetto.
5. **Avviare i Servizi con Docker**: Assicurati che Docker sia in esecuzione e di trovarti all'interno della cartella *backend*. Successivamente avvia i servizi necessari con il comando:
   ```bash
   docker-compose up --build
   ```
6. **Testare con Postman**: Utilizza Postman per inviare chiamate al server e analizzare le risposte ottenute.

Ricorda di consultare la documentazione del progetto per dettagli aggiuntivi e per qualsiasi chiarimento necessario. Questa procedura ti guiderà attraverso la configurazione, l'esecuzione dei test e l'interpretazione dei risultati, assicurando che il progetto funzioni come previsto.

## Autori

- ***[Alessandro Rongoni](https://github.com/AlessandroRongoni)***
- ***[Daniele Sergiacomi](https://github.com/sergytube)***

