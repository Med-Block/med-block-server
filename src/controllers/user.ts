import { Response } from 'express';
import { MedBlockRequest } from '../requests';
import { models } from '../services/db';
import { UserResponse } from '../response/user';
import { calculate, verify } from '../utils/hash';
import { EmailTemplates, sendEmail } from '../services/email';

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
    try {

        if (!email) {
            throw new Error('Invalid input');
        }

        user.email = email;
        await user.save();
        res.send(new UserResponse(user));
    } catch (error) {
        res.status(400).send('Invalid input');
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
    const position = req.body.position as string;
    const role = req.body.role as string;

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
            user.role = role as string ?? user.role;
            user.position = position;
        }
        await user.save();
        res.send(new UserResponse(user));
    } catch (error) {
        res.status(400).send('Invalid input');
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
    const users = role === 'admin' ? await models.User.findAll() : await models.User.findAll({
        where: {
            role: 'user'
        }
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