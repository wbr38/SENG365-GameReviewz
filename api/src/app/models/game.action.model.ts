import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";

export async function isGameWishlisted(userId: number, gameId: number): Promise<boolean> {
    const query = "SELECT EXISTS(SELECT * FROM wishlist WHERE user_id = ? AND game_id = ?) as gameWishlisted";

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [userId, gameId]);
    conn.release();

    type DBResult = { gameWishlisted: 1 | 0 };
    const rows = queryResult[0] as DBResult[];
    return !!rows[0].gameWishlisted;
}

export async function addGameToWishlist(userId: number, gameId: number): Promise<void> {
    const query = "INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)";

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [userId, gameId]);
    conn.release();
}

export async function removeGameFromWishlist(userId: number, gameId: number): Promise<boolean> {
    const query = "DELETE FROM wishlist WHERE user_id = ? AND game_id = ?";
    const conn = await getPool().getConnection();
    const queryResult = await conn.query<ResultSetHeader>(query, [userId, gameId]);
    conn.release();

    // Should not affect more than 1 row
    return queryResult[0].affectedRows == 1;
}

export async function addGameToOwned(userId: number, gameId: number): Promise<void> {
    const query = "INSERT INTO owned (user_id, game_id) VALUES (?, ?)";

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [userId, gameId]);
    conn.release();
}

export async function removeGameFromOwned(userId: number, gameId: number): Promise<boolean> {
    const query = "DELETE FROM owned WHERE user_id = ? AND game_id = ?";
    const conn = await getPool().getConnection();
    const queryResult = await conn.query<ResultSetHeader>(query, [userId, gameId]);
    conn.release();

    // Should not affect more than 1 row
    return queryResult[0].affectedRows == 1;
}

export async function isGameOwned(userId: number, gameId: number): Promise<boolean> {
    const query = "SELECT EXISTS(SELECT * FROM owned WHERE user_id = ? AND game_id = ?) AS gameOwned";

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [userId, gameId]);
    conn.release();

    type DBResult = { gameOwned: 1 | 0 };
    const rows = queryResult[0] as DBResult[];
    return !!rows[0].gameOwned;
}
