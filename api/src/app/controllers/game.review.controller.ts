import { Request, Response } from "express";
import Logger from "../../config/logger";
import { API_GameReview } from "../interfaces/game.review.interface";
import * as games from "../models/game.model";
import * as reviews from "../models/game.review.model";
import * as users from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { validate } from "../services/validator";

export async function getGameReviews(req: Request, res: Response): Promise<Response> {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const result = await reviews.getReviews(gameId);
        if (result.length == 0)
            return res.status(404).send("No game found with id");

        const response: API_GameReview[] = result.map(review => {
            return {
                reviewerId: review.user_id,
                reviewerFirstName: review.first_name,
                reviewerLastName: review.last_name,
                rating: review.rating,
                review: review.review,
                timestamp: review.timestamp
            };
        });

        return res.status(200).json(response);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function addGameReview(req: Request, res: Response): Promise<Response> {
    try {
        const validation = validate(schemas.game_review_post, req.body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

        const user = await users.getUserByToken(authToken);
        if (!user)
            return res.status(401).send();

        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("game id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game found with id");

        if (game.creator_id == user.id)
            return res.status(403).send("Cannot review your own game");

        const existingReview = await reviews.reviewExists(user.id, gameId);
        if (existingReview)
            return res.status(403).send("Can only review a game once.");

        const review = req.body.review as string | undefined;
        const rating = req.body.rating as number;
        await reviews.createReview(user.id, gameId, rating, review);
        return res.status(201).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}