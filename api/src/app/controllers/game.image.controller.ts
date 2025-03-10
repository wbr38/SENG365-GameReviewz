import { Request, Response } from "express";
import Logger from "../../config/logger";

export async function getImage(req: Request, res: Response): Promise<Response> {
    try {
        return res.status(501).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export async function setImage(req: Request, res: Response): Promise<Response> {
    try {
        return res.status(501).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}
