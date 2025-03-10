import { getPool } from "../../config/db";
import { DB_Game } from "../interfaces/game.interface";
import { API_GameReview, DB_GameReview } from "../interfaces/game.review.interface";
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

export async function getReviews(gameId: number): Promise<API_GameReview[]> {

    const query = `
    SELECT 
        game_review.*,
        user.first_name, user.last_name
    FROM game_review
    JOIN user ON user.id = game_review.user_id
    WHERE game_id = ?
    ORDER BY game_review.timestamp DESC
    `;

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [gameId]);
    conn.release();

    type DBResult = DB_GameReview & Pick<DB_User, "first_name" | "last_name">;
    const rows = queryResult[0] as DBResult[];

    const result: API_GameReview[] = rows.map(row => {
        const review: API_GameReview = {
            reviewerId: row.user_id,
            rating: row.rating,
            review: row.review,
            reviewerFirstName: row.first_name,
            reviewerLastName: row.last_name,
            timestamp: row.timestamp
        };
        return review;
    });

    return result;
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