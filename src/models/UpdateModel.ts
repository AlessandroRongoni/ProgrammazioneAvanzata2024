// src/models/UpdateEdgeModel.ts

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Edge } from './EdgeModel';
import { User } from './UserModel';

export const UpdateEdge = sequelize.define('UpdateEdge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  edgeId: {
    type: DataTypes.INTEGER,
    references: {
      model: Edge,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  newWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'updateEdges',
});

Edge.hasMany(UpdateEdge);
UpdateEdge.belongsTo(Edge);
User.hasMany(UpdateEdge);
UpdateEdge.belongsTo(User);
