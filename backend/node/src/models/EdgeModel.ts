// src/models/EdgeModel.ts

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Graph } from './GraphModel';

export const Edge = sequelize.define('Edge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  graphId: {
    type: DataTypes.INTEGER,
    references: {
      model: Graph,
      key: 'id',
    },
  },
  startNode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endNode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'edges',
});

Graph.hasMany(Edge);
Edge.belongsTo(Graph);
