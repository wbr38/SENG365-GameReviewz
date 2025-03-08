import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as users from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import * as passwords from "../services/passwords";
import { validate } from "../services/validator";
import { API_User } from "../interfaces/user.interface";

async function register(req: Request, res: Response): Promise<Response> {
    try {
        const validation = validate(schemas.user_register, req.body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const { email, password, firstName, lastName } = req.body;

        const emailInUse = await users.isEmailInUse(email);
        if (emailInUse)
            return res.status(403).send("Email is already in use");

        const result = await users.insert(firstName, lastName, email, password);
        return res.status(201).send({ "userId": result.insertId });
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

async function login(req: Request, res: Response): Promise<Response> {
    try {
        const validation = validate(schemas.user_login, req.body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const { email, password } = req.body;
        const loginResponse = await users.login(email, password);
        if (!loginResponse)
            return res.status(401).send("Invalid email/password");

        return res.status(200).json(loginResponse);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

async function logout(req: Request, res: Response): Promise<Response> {
    try {
        const authToken = req.get("X-Authorization");

        // Auth token not provided
        if (!authToken)
            return res.status(401).send();

        const loggedOut = await users.logout(authToken);
        if (!loggedOut)
            return res.status(401).send();

        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

async function view(req: Request, res: Response): Promise<Response> {
    try {
        // Parse id from params
        const id = parseInt(req.params.id);
        const user = await users.getUserById(id);
        if (!user)
            return res.status(404).send("No user with specified ID");

        let result: API_User = {
            firstName: user.first_name,
            lastName: user.last_name
        };

        // Add email to response if the user is viewing their own profile
        const authToken = req.get("X-Authorization");
        if (authToken) {
            const loggedInUser = await users.getUserByToken(authToken);
            if (loggedInUser?.id == user.id)
                result.email = user.email;
        }

        return res.status(200).json(result);
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

async function update(req: Request, res: Response): Promise<Response> {
    try {
        const validation = validate(schemas.user_edit, req.body);
        if (!validation.valid)
            return res.status(400).send(`Bad Request: ${validation.errorText}`);

        const authToken = req.get("X-Authorization");
        if (!authToken)
            return res.status(400).send();

        // Parse user id from params
        const userId = parseInt(req.params.id);
        if (!userId || isNaN(userId))
            return res.status(400).send();

        // Fetch user by id
        const user = await users.getUserById(userId);
        if (!user)
            return res.status(404).send("");

        // User with the given id does not match the auth token header
        if (user.auth_token != authToken)
            return res.status(403).send("Can not edit another user's information");

        const { email, firstName, lastName, password, currentPassword } = req.body as { [key: string]: string | undefined; };

        // Confirm email is not already in use
        if (email) {
            const emailInUse = await users.isEmailInUse(email);
            if (emailInUse)
                return res.status(403).send("Email is already in use");
        }

        // TODO: Does we care if currentPassword is sent but password is not?
        // currentPassword is only if password is sent, right?
        if (password) {
            if (!currentPassword)
                return res.status(400).send("currentPassword must be supplied");

            if (currentPassword == password)
                return res.status(403).send("Identical current and new passwords");

            const validPassword = await passwords.compare(currentPassword, user.password);
            if (!validPassword)
                return res.status(401).send("Unauthorized or Invalid currentPassword");
        }

        await users.update(user, email, firstName, lastName, password);
        return res.status(200).send();
    } catch (err) {
        Logger.error(err);
        return res.status(500).send();
    }
}

export { login, logout, register, update, view };
