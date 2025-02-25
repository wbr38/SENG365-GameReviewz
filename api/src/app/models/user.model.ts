import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { User } from "../interfaces/user.interface";
import * as passwords from "../services/passwords";

export async function getOne(email: string): Promise<User[]> {
    // TODO: Remember that /users/{id} API should only include the "email" field if the currently authenticated user is viewing their own details
    // Will be done with X-Authorization header?
    // But that functionality probably would be included in the controller side? not sure
    Logger.info(`Getting user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * from user where email = ?";
    const [ rows ] = await conn.query( query, [ email ] );
    await conn.release();
    return rows;
}

export async function insert(
    firstName: string,
    lastName: string,
    email: string,
    password: string
): Promise<ResultSetHeader> {
    const hashedPassword = await passwords.hash(password);

    // TODO: Hash password using bcrypt
    Logger.info(`Adding user "${email}" to the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO user (email, first_name, last_name, password) values ( ?, ?, ?, ? )';
    const [ result ] = await conn.query( query, [ email, firstName, lastName, hashedPassword ] );
    await conn.release();
    return result;
}