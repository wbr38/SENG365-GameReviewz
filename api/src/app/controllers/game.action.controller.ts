import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as gameActions from "../models/game.action.model";
import * as games from "../models/game.model";
import * as users from "../models/user.model";

export async function addGameToWishlist(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        // Parse id from params
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        if (game.creator_id == user.id)
            return res.status(403).send("Can not wishlist a game you created");

        const gameOwned = await gameActions.isGameOwned(user.id, game.id);
        if (gameOwned)
            return res.status(403).send("Can not wishlist a game you have marked as owned.");

        const gameWishlisted = await gameActions.isGameWishlisted(user.id, game.id);
        if (gameWishlisted)
            return res.status(403).send("Game is already wishlisted");

        await gameActions.addGameToWishlist(user.id, game.id);
        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function removeGameFromWishlist(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        // Parse id from params
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        const gameWishlisted = await gameActions.isGameWishlisted(user.id, game.id);
        if (!gameWishlisted)
            return res.status(403).send("Can not unwishlist a game that is not wishlisted.");

        await gameActions.removeGameFromWishlist(user.id, game.id);
        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function addGameToOwned(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        // Parse id from params
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        if (game.creator_id == user.id)
            return res.status(403).send("Can not own a game you created");

        const gameOwned = await gameActions.isGameOwned(user.id, game.id);
        if (gameOwned)
            return res.status(403).send("Game is already owned by the user.");

        // If wishlisted, remove from wishlist
        const gameWishlisted = await gameActions.isGameWishlisted(user.id, game.id);
        if (gameWishlisted)
            await gameActions.removeGameFromWishlist(user.id, game.id);

        await gameActions.addGameToOwned(user.id, game.id);
        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function removeGameFromOwned(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        // Parse id from params
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        const gameOwned = await gameActions.isGameOwned(user.id, game.id);
        if (!gameOwned)
            return res.status(403).send("Can not un-own a game that is not owned.");

        await gameActions.removeGameFromOwned(user.id, game.id);
        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}