import { NextFunction, Response } from "express";
import { MedBlockRequest } from "../requests";
import * as jwt from "../utils/jwt";
import { UserRole } from "../models/db/user";

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

export function claimGuard(claim: UserRole | UserRole[]) {
    return (req: MedBlockRequest, res: Response, next: NextFunction) => {
        try {
            req.token = getToken(req);
            req.user = jwt.verify(req.token);
            if (!req.user) {
                throw new Error("Invalid JWT token");
            }
            const userRole = req.user.role;
            if (!userRole) {
                throw new Error("Unauthorized. User role not found");
            }
            if (Array.isArray(claim)) {
                if (claim.length == 0) {
                    throw new Error("Unauthorized. Claim not found");
                }
                if (!claim.includes(userRole)) {
                    throw new Error("Permission denied");
                }
            } else {
                if (userRole != claim) {
                    throw new Error("Permission denied");
                }
            }
            next();
        } catch (err: any) {
            res.status(401).send(err.message);
        }
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