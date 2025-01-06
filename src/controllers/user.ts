import { Response } from 'express';
import { MedBlockRequest } from '../requests';
import { models } from '../services/db';
import { UserResponse } from '../response/user';
import { calculate, verify } from '../utils/hash';
import { EmailTemplates, sendEmail } from '../services/email';
import { Op, Order } from 'sequelize';

export async function getSelf(req: MedBlockRequest, res: Response) {
    const userId = req.user!.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    res.send(new UserResponse(user));
}

export async function getById(req: MedBlockRequest, res: Response) {
    const userId = req.params.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    res.send(new UserResponse(user));
}

export async function updateSelf(req: MedBlockRequest, res: Response) {
    const userId = req.user!.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    const email = req.body.email as string;
    const firstName = req.body.firstName as string | undefined;
    const lastName = req.body.lastName as string | undefined;

    try {
        if (!email) {
            throw new Error('Invalid input');
        }

        if (user.role === 'admin' && (!firstName || !lastName)) {
            throw new Error('Invalid input');
        }

        const searchUser = await models.User.findOne({
            where: {
                id: {
                    [Op.ne]: userId,
                },
                email: email
            }
        });
    
        if (searchUser) {
            throw new Error("There is a user with the same email address");
        }

        user.email = email;

        if (user.role === 'admin') {
            user.firstName = firstName!;
            user.lastName = lastName!;
        }

        await user.save();
        res.send(new UserResponse(user));
    } catch (error: any) {
        res.status(400).send(error.message);
        return;
    }
}

export async function restPassword(req: MedBlockRequest, res: Response) {
    const userId = req.params.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    const password = "".concat(Math.random().toString(36).substring(2, 15), Math.random().toString(36).substring(2, 15));
    user.password = calculate(password);

    sendEmail(user.email, EmailTemplates.RestPassword, {
        firstName: user.firstName,
        lastName: user.lastName,
        password: password
    });

    await user.save();
    res.send(new UserResponse(user));
}

export async function updateSelfPassword(req: MedBlockRequest, res: Response) {
    const userId = req.user!.id;
    const currentPassword = req.body.currentPassword as string;
    const newPassword = req.body.newPassword as string;

    if (newPassword.length < 6) {
        res.status(404).send('New password must have at least 6 characters');
        return;
    }

    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    if (!verify(currentPassword, user.password)) {
        res.status(400).send('Invalid password');
        return;
    }

    user.password = calculate(newPassword);
    await user.save();
    res.send(new UserResponse(user));
}

export async function updateById(req: MedBlockRequest, res: Response) {
    const reqRole = req.user!.role;
    const userId = req.params.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const position = req.body.position as string | undefined;

    try {
        if(user.role === 'admin' && reqRole !== 'admin') {
            throw new Error('You are not allowed to update this user');
        }
        if(user.role === 'doctor' && reqRole !== 'admin') {
            throw new Error('You are not allowed to update this user');
        }
        user.firstName = firstName as string ?? user.firstName;
        user.lastName = lastName as string ?? user.lastName;
        if (reqRole === 'admin') {
            user.position = user.role === 'doctor' ? position! : '';
        }
        await user.save();
        res.send(new UserResponse(user));
    } catch (error: any) {
        res.status(403).send(error.message);
        return;
    }
}

export async function blockSwitchById(req: MedBlockRequest, res: Response) {
    const userId = req.params.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.send(new UserResponse(user));
}

export async function getAll(req: MedBlockRequest, res: Response) {
    var role = req.user!.role;
    const options = {
        order: [ ['lastName', 'ASC'] ] as Order
    };
    const users = role === 'admin' ? await models.User.findAll(options) : await models.User.findAll({
        where: {
            role: 'user'
        },
        ...options
    });
    res.send(users.map(user => new UserResponse(user)));
}

export async function deleteUser(req: MedBlockRequest, res: Response) {
    const userId = req.params.id;
    const user = await models.User.findOne({
        where: {
            id: userId
        }
    });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    await user.destroy();
    res.send(new UserResponse(user));
}