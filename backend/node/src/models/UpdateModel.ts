import { DataTypes} from 'sequelize';
import { DbConnector } from '../db/db_connection';


/**
 * Connessione al database utilizzando il modulo di connessione Sequelize.
 * Viene autenticata la connessione al database e viene gestito il risultato dell'autenticazione.
 */
setTimeout(() => {}, 10000);
const sequelize = DbConnector.getConnection();
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error: any) => {
  console.error('Unable to connect to the database: ', error);
});


export const UpdateModel = sequelize.define('updates', {
    update_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    edge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'edges',
            key: 'edge_id',
        }
    },
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        }
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        }
    },
    new_weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null // Potrebbe essere null se l'aggiornamento è in attesa di approvazione
    }
}, {
    modelName: 'UpdateModel',
    timestamps: true, // Per tracciare createdAt e l'eventuale updatedAt
    freezeTableName: true
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
