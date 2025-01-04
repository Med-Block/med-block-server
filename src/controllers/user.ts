import { Response } from 'express';
import { MedBlockRequest } from '../requests';
import { models } from '../services/db';
import { UserResponse } from '../response/user';

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
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    try {
        user.email = email;
        user.firstName = firstName;
        user.lastName = lastName;
        await user.save();
        res.send(new UserResponse(user));
    } catch (error) {
        res.status(400).send('Invalid input');
        return;
    }
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
        user.firstName = firstName as string ?? user.firstName;
        user.lastName = lastName as string ?? user.lastName;
        user.position = position;
        if (reqRole === 'admin') {
            user.role = role as string ?? user.role;
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
            role: 'patient'
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