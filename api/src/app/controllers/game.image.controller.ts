import { Request, Response } from "express";
import Logger from "../../config/logger";


const getImage = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(501).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const setImage = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(501).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};


export { getImage, setImage };