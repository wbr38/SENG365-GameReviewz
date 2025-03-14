import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as userImages from "../models/user.image.model";
import * as users from "../models/user.model";
import * as storage from "../services/storage";

export async function getImage(req: Request, res: Response): Promise<Response> {
    try {
        // Parse id from params
        const userId = parseInt(req.params.id);
        if (isNaN(userId))
            return res.status(400).send("id must be a number");

        const user = await users.getUserById(userId);
        if (!user)
            return res.status(404).send("No user with specified ID");

        const imageFilename = user?.image_filename;
        if (!imageFilename)
            return res.status(404).send("User has no profile image");

        const mimeType = storage.getImageMimeType(imageFilename);
        if (!mimeType) {
            Logger.error(`User ${user.email} contains non-image profile picture: ${imageFilename}`);
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

        const userId = parseInt(req.params.id);
        if (isNaN(userId))
            return res.status(400).send("id must be a number");

        const user = await users.getUserById(userId);
        if (!user)
            return res.status(403).send("No such user with ID given");

        if (user.auth_token != authToken)
            return res.status(403).send("Can not change another user's profile photo");

        const contentType = req.header("Content-Type");
        if (!contentType || !storage.isValidImageType(contentType))
            return res.status(400).send("Invalid image supplied (possibly incorrect file type)");

        // "image/png" -> "png"
        const ext = contentType.replace("image/", "");
        const imageData = req.body;
        await userImages.setImage(user, imageData, ext);

        const updating = !!user.image_filename;
        if (updating)
            return res.status(200).send("Image updated");
        else
            return res.status(201).send("New image created");

    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function deleteImage(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");
        if (!authToken)
            return res.status(401).send();

        const userId = parseInt(req.params.id);
        if (isNaN(userId))
            return res.status(400).send("id must be a number");

        const user = await users.getUserById(userId);
        if (!user)
            return res.status(403).send("No such user with ID given");

        if (user.auth_token != authToken)
            return res.status(403).send("Can not delete another user's profile photo");

        const filename = user.image_filename;
        if (!filename)
            return res.status(400).send("User does not currently have an image set");

        await userImages.deleteImage(user);
        return res.status(200).send("");
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}