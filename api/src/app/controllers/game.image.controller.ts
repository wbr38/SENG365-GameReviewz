import { Request, Response } from "express";
import mime from "mime-types";
import Logger from "../../config/logger";
import * as gameImages from "../models/game.image.model";
import * as games from "../models/game.model";
import * as users from "../models/user.model";
import * as storage from "../services/storage";

export async function getImage(req: Request, res: Response): Promise<Response> {
    try {
        // Parse id from params
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId))
            return res.status(400).send("id must be a number");

        const game = await games.getGameById(gameId);
        if (!game)
            return res.status(404).send("No game with id");

        const imageFilename = game.image_filename;
        if (!imageFilename)
            return res.status(404).send("Game has no image");

        const mimeType = mime.lookup(imageFilename);
        if (!mimeType || !storage.isValidImageType(mimeType)) {
            Logger.error(`Game "${game.title}" contains non-image profile picture: ${imageFilename}`);
            return res.status(500).send();
        }

        const image = await storage.readImage(imageFilename);
        res.setHeader("Content-Type", mimeType);
        return res.status(200).send(image);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function setImage(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken) {
            return res.status(401).send();
        }

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
            return res.status(401).send("Can't change the image of a game you did not create");

        const contentType = req.header("Content-Type");
        if (!contentType || !storage.isValidImageType(contentType))
            return res.status(400).send("Invalid image supplied (possibly incorrect file type)");

        const existingImage = !!game.image_filename;

        // "image/png" -> "png"
        const ext = contentType.replace("image/", "");
        const imageData = req.body;
        await gameImages.setImage(gameId, imageData, ext);

        if (existingImage)
            return res.status(200).send("Image updated");
        else
            return res.status(201).send("Image added");
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}
