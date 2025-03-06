import mysql from "mysql2/promise";
import dotenv from "dotenv";
import Logger from "./logger";
dotenv.config();

const state: { pool: mysql.Pool } = {
    pool: null as unknown as mysql.Pool
};

const connect = async (): Promise<void> => {
    const port = process.env.SENG365_MYSQL_PORT ? parseInt(process.env.SENG365_MYSQL_PORT, 10) : 3306;

    state.pool = await mysql.createPool({
        connectionLimit: 100,
        multipleStatements: true,
        host: process.env.SENG365_MYSQL_HOST,
        user: process.env.SENG365_MYSQL_USER,
        password: process.env.SENG365_MYSQL_PASSWORD,
        database: process.env.SENG365_MYSQL_DATABASE,
        port,
        ssl: {
            rejectUnauthorized: false
        }
    } );
    await state.pool.getConnection(); // Check connection
    Logger.info(`Successfully connected to database`);
    return;
};

const getPool = () => {
    return state.pool;
};

export { connect, getPool };
