import { Dialect, Sequelize } from 'sequelize';
require('dotenv').config();

interface DBConfig {
  username: string;
  password: string | null;
  database: string;
  host: string;
  dialect: Dialect;
  logging: boolean;
}

const environment = process.env.NODE_ENV || 'development';

const baseConfig: DBConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'database_development',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false, // Imposta su true per vedere le query generate da Sequelize nel log
};

const environmentConfig: { [key: string]: Partial<DBConfig> } = {
  development: {},
  test: {
    database: process.env.DB_NAME_TEST || 'database_test',
  },
  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
  },
};

const config: DBConfig = { ...baseConfig, ...environmentConfig[environment] };

export const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password?.toString(),
    {
        host: config.host,
        dialect: config.dialect,
        logging: config.logging,
    }
);
