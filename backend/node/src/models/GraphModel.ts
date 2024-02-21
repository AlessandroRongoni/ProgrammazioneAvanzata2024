import { DataTypes } from 'sequelize';
import { DbConnector } from '../db/db_connection';


/**
 * Oggetto Sequelize per la connessione al database.
 */
const sequelize = DbConnector.getConnection();
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error: any) => {
  console.error('Unable to connect to the database: ', error);
});

/**
 * Represents a graph model.
 */
export const GraphModel = sequelize.define('graphs', {
    /**
     * The unique identifier of the graph.
     */
    graph_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    // Il creatore del grafo
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        }
    },
    /**
     * The name of the graph.
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    /**
     * The description of the graph.
     */
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    modelName: 'GraphModel',
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
    console.log('Graphs table created successfully!');
}).catch((error: any) => {
    console.error('Unable to create table : ', error);
});

