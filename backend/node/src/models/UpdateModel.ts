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
 * Modello per rappresentare un aggiornamento nel sistema.
 */
export const UpdateModel = sequelize.define('updates', {
    /**
     * Identificatore univoco dell'aggiornamento.
     */
    update_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    /**
     * Identificatore del grafo a cui l'aggiornamento fa riferimento.
     */
    graph_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'graphs',
            key: 'graph_id',
        }
    },
    /**
     * Identificatore dell'arco a cui l'aggiornamento fa riferimento.
     */
    edge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'edges',
            key: 'edge_id',
        }
    },
    /**
     * Identificatore dell'utente che ha richiesto l'aggiornamento.
     */
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        }
    },
    /**
     * Identificatore dell'utente che riceverà l'aggiornamento.
     */
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        }
    },
    /**
     * Nuovo peso dell'arco dopo l'aggiornamento.
     */
    new_weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    /**
     * Flag che indica se l'aggiornamento è stato approvato o meno.
     * Può essere null se l'aggiornamento è in attesa di approvazione.
     */
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
    }
}, {
    modelName: 'UpdateModel',
    timestamps: true,
    freezeTableName: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat'
});

/**
 * Crea le tabelle nel database utilizzando Sequelize.
 * Viene chiamato il metodo `sync()` su `sequelize` per sincronizzare il modello definito con le tabelle effettive nel database.
 * Viene gestito il risultato della sincronizzazione.
 */
sequelize.sync().then(() => {
    console.log('Updates table created successfully!');
}).catch((error: any) => {
    console.error('Unable to create table : ', error);
});
