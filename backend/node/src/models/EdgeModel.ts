
import { DataTypes} from 'sequelize';
import { DbConnector } from '../db/db_connection';


const sequelize = DbConnector.getConnection();
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error: any) => {
  console.error('Unable to connect to the database: ', error);
});

export const EdgeModel = sequelize.define('edges', {
    edge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    graph_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'graphs', // nome della tabella
            key: 'graph_id',
        }
    },
    start_node: {
        type: DataTypes.STRING,
        allowNull: false
    },
    end_node: {
        type: DataTypes.STRING,
        allowNull: false
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    modelName: 'EdgeModel',
    timestamps: false,
    freezeTableName: true
});