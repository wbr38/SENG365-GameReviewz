import { ResultSetHeader } from "mysql2";
import randtoken from "rand-token";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { User } from "../interfaces/user.interface";
import * as passwords from "../services/passwords";

export async function getUserByEmail(email: string): Promise<User | null> {
    Logger.info(`Fetching user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * from user where email = ?";
    const [rows] = await conn.query(query, [email]);
    await conn.release();

    if (Array.isArray(rows) && rows.length > 0)
        return rows[0] as User;

    return null;
}

export async function getUserByToken(authToken: string): Promise<User | null> {
    // Probably a bad idea to log auth tokens
    // Logger.info(`Getting user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * from user where auth_token = ?";
    const [rows] = await conn.query(query, [authToken]);
    await conn.release();

    if (Array.isArray(rows) && rows.length > 0)
        return rows[0] as User;

    return null;
}

export async function insert(
    firstName: string,
    lastName: string,
    email: string,
    password: string
): Promise<ResultSetHeader> {
    const hashedPassword = await passwords.hash(password);

    Logger.info(`Adding user "${email}" to the database`);
    const conn = await getPool().getConnection();
    const query = "INSERT INTO user (email, first_name, last_name, password) values ( ?, ?, ?, ? )";
    const [result] = await conn.query(query, [email, firstName, lastName, hashedPassword]);
    await conn.release();
    return result as ResultSetHeader;
}

interface LoginResponse {
    userId: number;
    token: string;
}

export async function login(
    email: string,
    password: string
): Promise<LoginResponse | false> {
    const user = await getUserByEmail(email);
    if (!user)
        return false;

    const passwordsMatch = await passwords.compare(password, user.password);
    if (!passwordsMatch)
        return false;

    const AUTH_TOKEN_LENGTH = 16;
    return {
        userId: user.id,
        token: randtoken.generate(AUTH_TOKEN_LENGTH)
    };
}

export async function logout(
    authToken: string
): Promise<boolean> {
    const user = await getUserByToken(authToken);
    if (!user)
        return false;

    Logger.info(`Logging out user ${user.email} from the database`);
    const conn = await getPool().getConnection();
    const query = "UPDATE user SET auth_token=null WHERE email = ?";
    await conn.query(query, [user.email]);
    await conn.release();
    return true;
}