// src/models/UserModel.ts

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
}, {
  tableName: 'users',
});
