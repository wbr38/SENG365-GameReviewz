import { Request, Response } from "express";

export default (req: Request, res: Response, next: () => void) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
    next();
};