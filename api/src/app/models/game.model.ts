import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import { API_Game, DB_Game, PostGame } from "../interfaces/game.interface";
import { DB_User } from "../interfaces/user.interface";

export enum GameSortMethod {
    ALPHABETICAL_ASC,
    ALPHABETICAL_DESC,
    PRICE_ASC,
    PRICE_DESC,
    CREATED_ASC,
    CREATED_DESC,
    RATING_ASC,
    RATING_DESC
}

export async function getGenres() {
    const conn = await getPool().getConnection();
    const query = "SELECT * FROM genre";
    const queryResult = await conn.query(query, []);
    conn.release();

    type DBResult = {
        id: number,
        name: string
    };
    const rows = queryResult[0] as DBResult[];

    type APIResult = {
        genreId: number,
        name: string
    }

    const result: APIResult[] = [];
    for (const row of rows)
        result.push({ genreId: row.id, name: row.name });

    return result;
}

export async function getPlatforms() {
    const conn = await getPool().getConnection();
    const query = "SELECT * FROM platform";
    const queryResult = await conn.query(query, []);
    conn.release();

    type DBResult = {
        id: number,
        name: string
    };
    const rows = queryResult[0] as DBResult[];

    type APIResult = {
        platformId: number,
        name: string
    }

    const result: APIResult[] = [];
    for (const row of rows)
        result.push({ platformId: row.id, name: row.name });

    return result;
}

export async function getGameByTitle(title: string): Promise<DB_Game | null> {
    const query = "SELECT * FROM game WHERE game.title = ?";
    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [title]);
    conn.release();

    const result = queryResult[0] as DB_Game[];
    if (result.length > 0)
        return result[0];

    return null;
}

export async function getGameById(gameId: number) {
    const query = `
    SELECT
        game.*,
        user.first_name, user.last_name,
        AVG(game_review.rating) AS avg_rating,
        GROUP_CONCAT(DISTINCT game_platforms.platform_id ORDER BY game_platforms.platform_id ASC) as platform_ids,
        (SELECT COUNT(*) FROM owned WHERE owned.game_id = game.id) as number_of_owners,
        (SELECT COUNT(*) FROM wishlist WHERE wishlist.game_id = game.id) as number_of_wishlists
    FROM game
    JOIN user on user.id = game.creator_id
    LEFT JOIN game_review ON game_review.game_id = game.id
    LEFT JOIN game_platforms ON game_platforms.game_id = game.id
    WHERE game.id = ?
    GROUP BY game.id;
    `;

    type DBResult = DB_Game & Pick<DB_User, "first_name" | "last_name"> & {
        number_of_owners: number,
        number_of_wishlists: number,
        platform_ids?: string;
        avg_rating?: string
    };

    const conn = await getPool().getConnection();
    const queryResult = await conn.query(query, [gameId]);
    conn.release();

    const rows = queryResult[0] as DBResult[];
    if (rows.length == 0)
        return null;

    const row = rows[0];

    type APIResponse = API_Game & {
        description: string;
        numberOfOwners: number;
        numberOfWishlists: number;
    };

    const result: APIResponse = {
        gameId: row.id,
        title: row.title,
        description: row.description,
        genreId: row.genre_id,
        creationDate: row.creation_date,
        creatorId: row.creator_id,
        price: row.price,
        creatorFirstName: row.first_name,
        creatorLastName: row.last_name,
        rating: row.avg_rating ? parseFloat(row.avg_rating) : 0,
        platformIds: row.platform_ids?.split(",").map(x => parseInt(x)) ?? [],
        numberOfOwners: row.number_of_owners,
        numberOfWishlists: row.number_of_wishlists
    };

    return result;
}

export async function getGames(
    startIndex?: number,
    count?: number,
    q?: string,
    genreIds?: number[],
    price?: number,
    platformIds?: number[],
    creatorId?: number,
    reviewerId?: number,
    sortBy?: GameSortMethod,
    ownedByUser?: DB_User,
    wishlistedByUser?: DB_User,
): Promise<{ games: API_Game[]; count: number; }> {

    const values: any[] = [];
    let query = `
        SELECT 
            game.*, 
            AVG(game_review.rating) AS avg_rating,
            GROUP_CONCAT(DISTINCT game_platforms.platform_id ORDER BY game_platforms.platform_id ASC) as platform_ids,
            user.first_name, user.last_name
        FROM game
        JOIN user ON user.id = game.creator_id
        LEFT JOIN game_review ON game_review.game_id = game.id
        LEFT JOIN game_platforms ON game_platforms.game_id = game.id
    `;

    if (ownedByUser) {
        query += " JOIN owned ON owned.game_id = game.id AND owned.user_id = ?";
        values.push(ownedByUser.id);
    }

    if (wishlistedByUser) {
        query += " JOIN wishlist ON wishlist.game_id = game.id AND wishlist.user_id = ?";
        values.push(wishlistedByUser.id);
    }

    query += " WHERE true";
    if (q) {
        query += " AND game.title LIKE ? OR game.description LIKE ?";
        values.push(`%${q}%`);
        values.push(`%${q}%`);
    }

    if (price != undefined) {
        query += " AND game.price <= ?";
        values.push(price);
    }

    if (reviewerId != undefined) {
        query += " AND game_review.user_id <= ?";
        values.push(reviewerId);
    }

    if (genreIds?.length) {
        query += " AND game.genre_id in (?)";
        values.push(genreIds);
    }

    if (platformIds?.length) {
        query += " AND game_platforms.platform_id in (?)";
        values.push(platformIds);
    }

    query += " GROUP BY game.id, user.id";

    sortBy ??= GameSortMethod.CREATED_ASC;
    const sortingMap: { [key in GameSortMethod]: string } = {
        [GameSortMethod.ALPHABETICAL_ASC]: " ORDER BY game.title ASC",
        [GameSortMethod.ALPHABETICAL_DESC]: " ORDER BY game.title DESC",
        [GameSortMethod.PRICE_ASC]: " ORDER BY game.price ASC",
        [GameSortMethod.PRICE_DESC]: " ORDER BY game.price DESC",
        [GameSortMethod.CREATED_ASC]: " ORDER BY game.creation_date ASC",
        [GameSortMethod.CREATED_DESC]: " ORDER BY game.creation_date DESC",
        [GameSortMethod.RATING_ASC]: " ORDER BY avg_rating ASC",
        [GameSortMethod.RATING_DESC]: " ORDER BY avg_rating DESC",
    }
    query += sortingMap[sortBy];

    const conn = await getPool().getConnection();
    const [rows] = await conn.query(query, values);
    conn.release();

    type DBResult = DB_Game & Pick<DB_User, "first_name" | "last_name"> & {
        avg_rating?: string;
        platform_ids?: string;
    };

    let result = rows as DBResult[];
    const gamesCount = result.length;

    startIndex ??= 0;
    count ??= result.length;
    result = result.slice(startIndex, startIndex + count);

    const games = result.map(row => {
        const apiGame: API_Game = {
            gameId: row.id,
            title: row.title,
            genreId: row.genre_id,
            creatorId: row.creator_id,
            creatorFirstName: row.first_name,
            creatorLastName: row.last_name,
            price: row.price,
            rating: row.avg_rating ? parseFloat(row.avg_rating) : 0,
            platformIds: row.platform_ids?.split(",").map(x => parseInt(x)) ?? [],
            creationDate: row.creation_date
        };
        return apiGame;
    });

    return {
        games,
        count: gamesCount
    };
}

async function addPlatforms(gameId: number, platforms: number[]): Promise<ResultSetHeader> {

    // For each platformId add (game_id, platform_id)
    const valueStr = platforms.map(x => "(?, ?)").join(", ");
    const values = platforms.flatMap(platformId => [gameId, platformId]);

    let query = `
    INSERT INTO game_platforms (game_id, platform_id)
    VALUES ${valueStr}
    `;

    const conn = await getPool().getConnection();
    const [result] = await conn.query<ResultSetHeader>(query, values);
    conn.release();
    return result;
}

export async function addGame(user: DB_User, postGame: PostGame) {

    const query = `
    INSERT INTO game (title, description, creation_date, creator_id, genre_id, price)
    VALUES (?, ?, NOW(), ?, ?, ?);
    `;

    const values = [
        postGame.title,
        postGame.description,
        user.id,
        postGame.genreId,
        postGame.price
    ];

    const conn = await getPool().getConnection();
    const [result] = await conn.query<ResultSetHeader>(query, values);
    conn.release();

    // Add platforms for newly inserted game
    const gameId = result.insertId;
    await addPlatforms(gameId, postGame.platformIds);
    return {
        gameId: result.insertId
    };
}