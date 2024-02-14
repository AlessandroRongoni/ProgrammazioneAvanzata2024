import { DataTypes} from 'sequelize';
import { DbConnector } from '../db/db_connection';


/**
 * Connessione al database utilizzando il modulo di connessione Sequelize.
 * Viene autenticata la connessione al database e viene gestito il risultato dell'autenticazione.
 */
const sequelize = DbConnector.getConnection();
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error: any) => {
  console.error('Unable to connect to the database: ', error);
});

/**
 * Definizione del modello "user" per la tabella del database.
 * Il modello definisce le proprietà e i tipi di dati associati alla tabella "user".
 */
export const UserModel = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tokens: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    modelName: 'UserModel',
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
});

/**
 * Crea le tabelle nel database utilizzando Sequelize.
 * Viene chiamato il metodo `sync()` su `sequelize` per sincronizzare il modello definito con le tabelle effettive nel database.
 * Viene gestito il risultato della sincronizzazione.
 */
sequelize.sync().then(() => {
    console.log('User table created successfully!');
}).catch((error: any) => {
    console.error('Unable to create table : ', error);
});


