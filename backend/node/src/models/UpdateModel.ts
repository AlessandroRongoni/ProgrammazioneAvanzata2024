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
    new_weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true, // potrebbe essere `null` se l'aggiornamento è in attesa di approvazione
    }
}, {
    modelName: 'UpdateModel',
    timestamps: true, // Per tracciare `createdAt` e l'eventuale `updatedAt`
    freezeTableName: true
});
