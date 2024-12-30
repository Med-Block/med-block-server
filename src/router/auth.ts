import { Router, Response } from "express";
import { MedBlockRequest } from "../requests";
import * as hash from "../utils/hash";
import * as jwt from "../utils/jwt";
import { db, models } from "../services/db";
import { UserResponse } from "../response/user";

const router = Router();

router.post("/login", async (req: MedBlockRequest, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;

    var user = await models.User.findOne({
        where: {
            email: email
        }
    });
    if (!user) {
        res.status(401).send("Invalid username or password");
        return;
    }

    if (!hash.verify(password, user.password)) {
        res.status(401).send("Invalid password or username");
        return;
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    });

    res.send(token);
});

router.post("/register", async (req: MedBlockRequest, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;

    try {
        if(!email || !password || !firstName || !lastName) {
            throw new Error("Invalid request");
        }

        const searchUser = await models.User.findOne({
            where: {
                email: email
            }
        });

        if (searchUser) {
            throw new Error("User already exists");
        }

        const user = await models.User.create({
            email: email,
            password: hash.calculate(password),
            role: 'user',
            firstName: firstName,
            lastName: lastName,
            isBlocked: false
        });

        res.send(new UserResponse(user));
    } catch (error: any) {
        res.status(403).send(error.message);
    }
});

export default router;