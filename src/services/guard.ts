import { NextFunction, Response } from "express";
import { MedBlockRequest } from "../requests";
import * as jwt from "../utils/jwt";

export function guard(req: MedBlockRequest, res: Response, next: NextFunction): void {
    try {
        req.token = getToken(req);
        req.user = jwt.verify(req.token);
        if (!req.user) {
            throw new Error("Invalid JWT token");
        }
        next();
    } catch (err: any) {
        res.status(401).send(err.message);
    }
}

export function claimGuard(claim: string) {
    return (req: MedBlockRequest, res: Response, next: NextFunction) => {
        // try {
        //     req.token = getToken(req);
        //     req.user = jwt.verify(req.token);
        //     if (!req.user) {
        //         throw new Error("Invalid JWT token");
        //     }
        //     if (!req.user.claims.includes(claim)) {
        //         throw new Error("Unauthorized");
        //     }
        //     next();
        // } catch (err: any) {
        //     res.status(401).send(err.message);
        // }
    };
}

function getToken(req: MedBlockRequest): string {
    let token = req.headers["authorization"] || "";
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token == "") {
        throw new Error("JWT token not found");
    }
    return token;
}