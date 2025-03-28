import { ResultSetHeader } from "mysql2";
import randtoken from "rand-token";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import * as passwords from "../services/passwords";
import { DBUser } from "../interfaces/user.interface";

async function getUserByEmail(email: string): Promise<DBUser | null> {
    Logger.info(`Fetching user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * from user WHERE user.email = ?";
    const [rows] = await conn.query(query, [email]);
    conn.release();

    if (Array.isArray(rows) && rows.length > 0)
        return rows[0] as DBUser;

    return null;
}

export async function isEmailInUse(email: string): Promise<boolean> {
    const fetchedUser = await getUserByEmail(email);
    return !!fetchedUser;
}

export async function getUserById(id: number): Promise<DBUser | null> {
    Logger.info(`Fetching user with id #${id} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * FROM user WHERE user.id = ?";
    const [rows] = await conn.query(query, [id]);
    conn.release();

    if (Array.isArray(rows) && rows.length > 0)
        return rows[0] as DBUser;

    return null;
}

export async function getUserByToken(authToken: string): Promise<DBUser | null> {
    // Probably a bad idea to log auth tokens
    // Logger.info(`Getting user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = "SELECT * FROM user WHERE user.auth_token = ?";
    const [rows] = await conn.query(query, [authToken]);
    conn.release();

    if (Array.isArray(rows) && rows.length > 0)
        return rows[0] as DBUser;

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
    conn.release();
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
    const authToken = randtoken.generate(AUTH_TOKEN_LENGTH);

    // Update DB
    Logger.info(`User ${user.email} logged in, updating authToken in database`);
    const conn = await getPool().getConnection();
    const query = "UPDATE user SET user.auth_token=? WHERE user.id=?";
    await conn.query(query, [authToken, user.id]);
    conn.release();

    return {
        userId: user.id,
        token: authToken
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
    const query = "UPDATE user SET user.auth_token=null WHERE user.id = ?";
    await conn.query(query, [user.id]);
    conn.release();
    return true;
}

export async function update(
    user: DBUser,
    email?: string,
    firstName?: string,
    lastName?: string,
    password?: string
): Promise<void> {

    const fields = [];
    const values = [];

    if (firstName) {
        fields.push("first_name=?");
        values.push(firstName);
    }

    if (lastName) {
        fields.push("last_name=?");
        values.push(lastName);
    }

    if (email) {
        fields.push("email=?");
        values.push(email);
    }

    if (password) {
        const hashedPassword = await passwords.hash(password);
        fields.push("password=?");
        values.push(hashedPassword);
    }

    Logger.info(`Updating user #${user.id} in the database`);
    const conn = await getPool().getConnection();

    values.push(user.id);
    const query = `UPDATE user SET ${fields.join(", ")} WHERE user.id = ?`;
    await conn.query(query, values);
    conn.release();
}