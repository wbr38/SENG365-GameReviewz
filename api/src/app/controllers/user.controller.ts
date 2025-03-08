import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as users from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import * as passwords from "../services/passwords";
import { validate } from "../services/validator";

const register = async (req: Request, res: Response): Promise<void> => {

    const validation = validate(schemas.user_register, req.body);
    if (!validation.valid) {
        res.status(400).send(`Bad Request: ${validation.errorText}`);
        return;
    }

    const { email, password, firstName, lastName } = req.body;
    try {
        const emailInUse = await users.isEmailInUse(email);
        if (emailInUse) {
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

interface ViewUserResponse {
    /** Only defined if the user is viewing their own profile */
    email?: string;
    firstName: string;
    lastName: string;
}

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse id from params
        const idStr = req.params.id;
        if (!idStr) {
            res.status(400).send();
            return;
        }

        const id = parseInt(idStr);
        const fetchedUser = await users.getUserById(id);
        if (!fetchedUser) {
            res.status(404).send("No user with specified ID");
            return;
        }

        let result: ViewUserResponse = {
            firstName: fetchedUser.first_name,
            lastName: fetchedUser.last_name
        };

        // Add email to response if the user is viewing their own profile
        const authToken = req.get("X-Authorization");
        if (authToken) {
            const loggedInUser = await users.getUserByToken(authToken);
            if (loggedInUser?.id == fetchedUser.id)
                result["email"] = fetchedUser.email;
        }

        res.status(200).json(result);

    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

const update = async (req: Request, res: Response): Promise<any> => {
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

        const { email, firstName, lastName, password, currentPassword } = req.body as { [key: string]: string | undefined };

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
                return { statusCode: 401, message: "Unauthorized or Invalid currentPassword" };
        }

        await users.update(user, email, firstName, lastName, password);
        res.status(200).send();
    } catch (err) {
        Logger.error(err);
        res.status(500).send();
    }
};

export { login, logout, register, update, view };
