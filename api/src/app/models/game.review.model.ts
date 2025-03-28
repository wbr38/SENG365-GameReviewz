import { getPool } from "../../config/db";
import { DB_Game } from "../interfaces/game.interface";
import { DB_GameReview } from "../interfaces/game.review.interface";
import { DB_User } from "../interfaces/user.interface";

export async function reviewExists(userId: number, gameId: number): Promise<boolean> {
    const query = `
    SELECT *
    FROM game_review
    WHERE game_review.user_id = ? AND game_review.game_id = ?
    `;

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [userId, gameId]);
    conn.release();

    const rows = queryResult[0] as DB_Game[];
    return rows.length > 0;
}

export async function doesGameHaveReviews(gameId: number): Promise<boolean> {
    const query = "SELECT EXISTS(SELECT * FROM game_review WHERE game_review.game_id = ?) AS gameReviewed";

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [gameId]);
    conn.release();

    type DBResult = { gameReviewed: 1 | 0 };
    const rows = queryResult[0] as DBResult[];
    return !!rows[0].gameReviewed;
}


export async function getReviews(gameId: number) {

    const query = `
    SELECT
        game_review.*,
        user.first_name, user.last_name
    FROM game_review
    JOIN user ON user.id = game_review.user_id
    WHERE game_review.game_id = ?
    ORDER BY game_review.timestamp DESC
    `;

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [gameId]);
    conn.release();

    type DBResult = DB_GameReview & Pick<DB_User, "first_name" | "last_name">;
    const rows = queryResult[0] as DBResult[];
    return rows;
}

export async function createReview(
    userId: number,
    gameId: number,
    rating: number,
    review?: string
): Promise<void> {
    const query = `
    INSERT INTO game_review(game_id, user_id, rating, review, timestamp)
    VALUES (?, ?, ?, ?, NOW())
    `;

    const values = [
        gameId,
        userId,
        rating,
        review
    ];

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, values);
    conn.release();
}