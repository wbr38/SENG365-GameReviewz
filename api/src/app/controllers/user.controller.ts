import { Request, Response } from "express";
import * as schemas from "../resources/schemas.json";
import Logger from "../../config/logger";
import { validate } from "../services/validator";
import * as users from "../models/user.model";


const register = async (req: Request, res: Response): Promise<void> => {

    const validation = validate(schemas.user_register, req.body);
    if (!validation.valid) {
        res.status(400).send(`Bad Request: ${validation.errorText}`);
        return;
    }

    const { email, password, firstName, lastName } = req.body;
    try {
        const existingUser = await users.getUserByEmail(email);
        if (existingUser) {
            res.status(403).send("Email is already in use");
            return;
        }

        const result = await users.insert(firstName, lastName, email, password);
        res.status(201).send({ "userId": result.insertId });
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const login = async (req: Request, res: Response): Promise<void> => {

    const validation = validate(schemas.user_login, req.body);
    if (!validation.valid) {
        res.status(400).send(`Bad Request: ${validation.errorText}`);
        return;
    }

    const { email, password } = req.body;
    try {
        const loginResponse = await users.login(email, password);
        if (!loginResponse) {
            res.status(401).send("Invalid email/password");
            return;
        }

        res.status(200).json(loginResponse);
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    const authToken = req.get("X-Authorization");

    // Auth token not provided
    if (!authToken) {
        res.status(401).send();
        return;
    }

    try {
        const loggedOut = await users.logout(authToken);
        if (!loggedOut) {
            res.status(401).send();
            return;
        }

        res.status(200).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(501).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const update = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(501).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

export { register, login, logout, view, update };