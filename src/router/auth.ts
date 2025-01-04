import { Router, Response } from "express";
import { MedBlockRequest } from "../requests";
import * as hash from "../utils/hash";
import * as jwt from "../utils/jwt";
import { models } from "../services/db";
import { UserResponse } from "../response/user";
import { claimGuard } from "../services/guard";
import { EmailTemplates, sendEmail } from "../services/email";

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
        res.status(401).send("Invalid email or password");
        return;
    }

    if (!hash.verify(password, user.password)) {
        res.status(401).send("Invalid email or password");
        return;
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    });

    res.send(token);
});

router.post("/register", claimGuard(['admin', 'doctor']), async (req: MedBlockRequest, res: Response) => {
    const requestUser = req.user!;

    const email = req.body.email as string;
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const role = req.body.role as string;
    const position = req.body.position as string | undefined;
    const password = "".concat(Math.random().toString(36).substring(2, 15), Math.random().toString(36).substring(2, 15));

    try {
        if(!email || !firstName || !lastName) {
            throw new Error("Invalid request. Expected email, firstName, lastName");
        }

        if(!role) {
            throw new Error("Invalid request. Expected role");
        }

        if(role === 'doctor' && !position) {
            throw new Error("Invalid request. Expected position for doctor");
        }

        if(role === 'doctor' && requestUser.role !== 'admin') {
            throw new Error("You are not allowed to create a doctor");
        }

        if(role === 'admin' && requestUser.role !== 'admin') {
            throw new Error("You are not allowed to create an admin");
        }

        const searchUser = await models.User.findOne({
            where: {
                email: email
            }
        });

        if (searchUser) {
            throw new Error("There is a user with the same email address");
        }

        const user = await models.User.create({
            email: email,
            password: hash.calculate(password),
            role: role,
            firstName: firstName,
            lastName: lastName,
            position: role === 'doctor' ? position : undefined,
            isBlocked: false
        });

        sendEmail(email, EmailTemplates.Register, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        });

        res.send(new UserResponse(user));
    } catch (error: any) {
        res.status(403).send(error.message);
    }
});

export default router;