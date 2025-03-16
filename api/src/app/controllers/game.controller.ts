import { Request, Response } from "express";
import { ParsedQs } from "qs";
import Logger from "../../config/logger";
import { API_Game, PostGame } from "../interfaces/game.interface";
import { DB_User } from "../interfaces/user.interface";
import * as games from "../models/game.model";
import { GameSortMethod } from "../models/game.model";
import * as gameActions from "../models/game.review.model";
import * as users from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { validate } from "../services/validator";

namespace ParamsUtil {
    // ParsedQs is the type of req.query;

    export function ParseValue<T>(params: ParsedQs, key: string, convert: (value: any) => T): T | undefined {
        const param = params[key];
        if (typeof param === "string") {
            return convert(param);
        }

        return undefined;
    }

    export function ParseArray<T>(params: ParsedQs, key: string, convert: (value: any) => T): T[] {
        let result = [] as T[];
        const param = params[key];

        // Single value
        if (typeof param === "string") {
            result.push(convert(param));
            return result;
        }

        // Array, convert values
        if (Array.isArray(param)) {
            for (const value of param) {
                if (typeof value !== "string")
                    continue;

                result.push(convert(value));
            }
        }

        return result;
    }
}

export async function getAllGames(req: Request, res: Response): Promise<Response> {

    const parseBoolean = (x: string) => x == "true";
    const parseSortMethod = (sortMethod: keyof typeof GameSortMethod): GameSortMethod | undefined => {
        return GameSortMethod[sortMethod];
    };

    try {
        const validation = validate(schemas.game_search, req.query);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const params = req.query;
        const startIndex = ParamsUtil.ParseValue(params, "startIndex", parseInt);
        const count = ParamsUtil.ParseValue(params, "count", parseInt);

        let q: string | undefined;
        if (typeof params.q == "string")
            q = params.q;

        const genreIds = ParamsUtil.ParseArray(params, "genreIds", parseInt);
        if (!genreIds)
            return res.status(400).send();

        // Verify genreIds are valid
        const allGenres = await games.getGenres();
        const allGenreIds = allGenres.map((x) => x.genreId);
        const validGenreIds = genreIds.every((value) => allGenreIds.includes(value));
        if (!validGenreIds)
            return res.status(400).send();

        const price = ParamsUtil.ParseValue(params, "price", parseInt);

        const platformIds = ParamsUtil.ParseArray(params, "platformIds", parseInt);
        if (!platformIds)
            return res.status(400).send();

        // Verify platformIds are valid
        const allPlatforms = await games.getPlatforms();
        const allPlatformIds = allPlatforms.map((x) => x.platformId);
        const validPlatforms = platformIds.every((value) => allPlatformIds.includes(value));
        if (!validPlatforms)
            return res.status(400).send();

        const creatorId = ParamsUtil.ParseValue(params, "creatorId", parseInt);
        const reviewerId = ParamsUtil.ParseValue(params, "reviewerId", parseInt);
        const sortBy = ParamsUtil.ParseValue(params, "sortBy", parseSortMethod);

        let user: DB_User | undefined = undefined;
        const authToken = req.get("X-Authorization");
        if (authToken) {
            user = await users.getUserByToken(authToken) ?? undefined;
        }

        let ownedByUser: DB_User | undefined = undefined;
        const ownedByMe = ParamsUtil.ParseValue(params, "ownedByMe", parseBoolean);
        if (ownedByMe) {
            if (!user)
                return res.status(401).send("");

            ownedByUser = user;
        }

        const wishlistedByMe = ParamsUtil.ParseValue(params, "wishlistedByMe", parseBoolean);
        let wishlistedByUser: DB_User | undefined = undefined;
        if (wishlistedByMe) {
            if (!user)
                return res.status(401).send("");

            wishlistedByUser = user;
        }

        const gamesResult = await games.getGames(
            startIndex,
            count,
            q,
            genreIds,
            price,
            platformIds,
            creatorId,
            reviewerId,
            sortBy,
            ownedByUser,
            wishlistedByUser
        );

        type APIResult = {
            games: API_Game[],
            count: number
        };

        const result: APIResult = {
            games: gamesResult.games.map(game => {
                return {
                    gameId: game.id,
                    title: game.title,
                    genreId: game.genre_id,
                    creationDate: game.creation_date,
                    creatorId: game.creator_id,
                    price: game.price,
                    creatorFirstName: game.first_name,
                    creatorLastName: game.last_name,
                    rating: game.avg_rating ? parseFloat(game.avg_rating) : 0,
                    platformIds: game.platform_ids?.split(",").map(x => parseInt(x)) ?? [],
                };
            }),
            count: gamesResult.count
        }

        return res.status(200).json(result);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function getGame(req: Request, res: Response): Promise<Response> {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        type APIResult = API_Game & {
            description: string,
            numberOfWishlists: number,
            numberOfOwners: number,
        };

        const response: APIResult = {
            gameId: game.id,
            title: game.title,
            description: game.description,
            genreId: game.genre_id,
            creationDate: game.creation_date,
            creatorId: game.creator_id,
            price: game.price,
            creatorFirstName: game.first_name,
            creatorLastName: game.last_name,
            rating: game.avg_rating ? parseFloat(game.avg_rating) : 0,
            platformIds: game.platform_ids?.split(",").map(x => parseInt(x)) ?? [],
            numberOfWishlists: game.number_of_wishlists,
            numberOfOwners: game.number_of_owners,
        };

        return res.status(200).json(response);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function addGame(req: Request, res: Response): Promise<Response> {

    try {
        const authToken = req.get("X-Authorization");
        if (!authToken)
            return res.status(401).send();

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        const body: PostGame = req.body;
        const validation = validate(schemas.game_post, body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        // Verify platformIds are valid
        const allPlatforms = await games.getPlatforms();
        const allPlatformIds = allPlatforms.map((x) => x.platformId);
        const validPlatforms = body.platformIds.every((value) => allPlatformIds.includes(value));
        if (!validPlatforms || body.platformIds.length <= 0)
            return res.status(400).send("Invalid platform id sent");

        // Verify genreIds are valid
        const allGenres = await games.getGenres();
        const allGenreIds = allGenres.map((x) => x.genreId);
        const validGenreId = allGenreIds.includes(body.genreId);
        if (!validGenreId)
            return res.status(400).send("Invalid genre id");

        // Confirm the game title is not already in use
        const existingGame = await games.getGameByTitle(body.title);
        if (existingGame)
            return res.status(403).send("Game title already exists");

        const result = await games.addGame(user, body);
        if (!result)
            return res.status(400).json();

        return res.status(201).json(result);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function editGame(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken)
            return res.status(401).send();

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const validation = validate(schemas.game_post, req.body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game found with id");

        if (game.creator_id != user.id)
            return res.status(403).send("Only the creator of a game may change it");

        const { title, description, price, platformIds, genreId } = req.body;

        const existingGame = await games.getGameByTitle(title);
        if (existingGame)
            return res.status(403).send("Game title already exists");

        const success = await games.editGame(game.id, title, description, price, platformIds, genreId);
        const statusCode = success ? 200 : 400;
        return res.status(statusCode).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function deleteGame(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken)
            return res.status(401).send();

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game found with id");

        if (game.creator_id != user.id)
            return res.status(403).send("Only the creator of a game may delete it");

        const hasReviews = await gameActions.doesGameHaveReviews(game.id);
        if (hasReviews)
            return res.status(403).send("Can not delete a game with one or more reviews");

        const deleted = await games.deleteGame(gameId);
        if (!deleted)
            return res.status(500).send();

        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}


export async function getGenres(req: Request, res: Response): Promise<Response> {
    try {
        const genres = await games.getGenres();
        return res.status(200).json(genres);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function getPlatforms(_req: Request, res: Response): Promise<Response> {
    try {
        const platforms = await games.getPlatforms();
        return res.status(200).json(platforms);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}