import { DataTypes } from 'sequelize';
import { DbConnector } from '../db/db_connection';

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
    }
}, {
    modelName: 'GraphModel',
    timestamps: true,
    freezeTableName: true
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
