import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { User } from './UserModel';

export const Graph = sequelize.define('Graph', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'graphs',
});

User.hasMany(Graph);
Graph.belongsTo(User);
