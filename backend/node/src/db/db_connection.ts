import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const dbUsername = process.env.PGUSER || 'user'; //
const dbPassword = process.env.PGPASSWORD; // Assicurati di avere questa variabile definita nel tuo .env
const dbName = process.env.PGDATABASEE || 'my_db'; // Fornisce un valore di default se MYSQL_DB_NAME non è definito
const dbHost = process.env.PGHOST || 'db_host'; // Fornisce un valore di default se MYSQL_HOST non è definito
const dbPort = process.env.PGPORT || '5432'; // Fornisce un valore di default se MYSQL_PORT non è definito
/**
 * Classe per la connessione al database.
 * Utilizza il pattern Singleton per garantire una sola istanza di connessione.
 */
export class DbConnector {
    private static instance: DbConnector;
    private sequelizer: any;
    private constructor() {
        this.sequelizer = new Sequelize(dbName, dbUsername, dbPassword, {
            host: dbHost,
            dialect: 'postgres',
        });
    }

    /**
     * Ottiene l'istanza della connessione al database.
     * Restituisce l'oggetto Sequelize per la connessione.
     *
     * @returns L'istanza della connessione al database.
     */
    public static getConnection(): any {
        if (!DbConnector.instance) {
            this.instance = new DbConnector();
        }
        return DbConnector.instance.sequelizer;
    }
}