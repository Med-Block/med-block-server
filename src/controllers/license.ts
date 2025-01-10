import { MedBlockRequest } from "../requests";
import { Response } from "express";
import { models } from "../services/db";
import { sendEmail } from "../services/email";
import { UserResponse } from "../response/user";

export async function activateLicense(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const doctorId = req.body.doctorId;

    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    const doctor = await models.User.findByPk(doctorId);
    if (!doctor) {
        return res.status(404).send("Doctor not found");
    }

    if (user.role !== "user") {
        return res.status(400).send("Only users can grant access to their data");
    }

    if (doctor.role !== "doctor") {
        return res.status(400).send("Only doctors can request access to user's data");
    }

    let license = await models.License.findOne({
        where: {
            userId,
            doctorId,
        }
    });

    if (license && license.isActive) {
        return res.status(400).send("You already have a license with this doctor");
    }

    if (license) {
        license.isActive = true;
        license.updatedAt = new Date();
        await license.save();
    } else {
        await models.License.create({
            userId,
            doctorId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        license = await models.License.findOne({
            where: {
                userId,
                doctorId,
            }
        });
    }

    await models.LicenseLog.create({
        licenseId: license!.id,
        userId,
        event: "activate",
        createdAt: new Date()
    });

    await sendEmail(doctor.email, 'license.html', {
        userFirstName: user.firstName,
        userLastName: user.lastName,
        doctorFirstName: doctor.firstName,
        doctorLastName: doctor.lastName,
        licenseId: license!.id,
        state: "active"
    });

    return res.status(200).send("License created");
}

export async function deactivateLicense(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const doctorId = req.body.doctorId;

    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    const doctor = await models.User.findByPk(doctorId);
    if (!doctor) {
        return res.status(404).send("Doctor not found");
    }

    if (user.role !== "user") {
        return res.status(400).send("Only patients can grant access to their data");
    }

    if (doctor.role !== "doctor") {
        return res.status(400).send("Only doctors can request access to patients's data");
    }

    const license = await models.License.findOne({
        where: {
            userId,
            doctorId,
        }
    });

    if (!license || !license.isActive) {
        return res.status(400).send("You don't have a license with this doctor");
    }

    license.isActive = false;
    license.updatedAt = new Date();
    await license.save();

    await models.LicenseLog.create({
        licenseId: license.id,
        userId,
        event: "deactivate",
        createdAt: new Date()
    });

    await sendEmail(doctor.email, 'license.html', {
        userFirstName: user.firstName,
        userLastName: user.lastName,
        doctorFirstName: doctor.firstName,
        doctorLastName: doctor.lastName,
        licenseId: license.id,
        state: "deactivated"
    });

    return res.status(200).send("License deactivated");
}

export async function forceDeactivateLicense(req: MedBlockRequest, res: Response): Promise<any> {
    const licenseId = req.params.id;
    const reqUser = req.user!;
    const license = await models.License.findByPk(licenseId);
    if (!license) {
        return res.status(404).send("License not found");
    }

    if (reqUser.role !== "admin") {
        return res.status(400).send("Only admins can deactivate licenses");
    }

    license.isActive = false;
    license.updatedAt = new Date();
    await license.save();

    await models.LicenseLog.create({
        licenseId: license.id,
        userId: reqUser.id,
        event: "force_deactivate",
        createdAt: new Date()
    });

    const user = await models.User.findByPk(license.userId);
    const doctor = await models.User.findByPk(license.doctorId);

    if (!user || !doctor) {
        return res.status(500).send("Patient or doctor not found");
    }

    await sendEmail(doctor.email, 'license.html', {
        userFirstName: user.firstName,
        userLastName: user.lastName,
        doctorFirstName: doctor.firstName,
        doctorLastName: doctor.lastName,
        licenseId: license.id,
        state: "force deactivated"
    });

    return res.status(200).send("License deactivated");
}

export async function getLicenses(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    let whereParams: any = {};
    if (user.role === "user") {
        whereParams.userId = userId;
    } else if (user.role === "doctor") {
        whereParams.doctorId = userId;
    }

    const licenses = await models.License.findAll({
        where: whereParams,
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    return res.send(licenses);
}

export async function getSelfLicenseLogs(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const licenseId = req.params.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    if (user.role !== "user") {
        return res.status(400).send("Only patients can view their license logs");
    }

    const license = await models.License.findByPk(licenseId);
    if (!license) {
        return res.status(404).send("License not found");
    }

    if (license.userId !== userId && license.doctorId !== userId) {
        return res.status(400).send("You don't have access to this license");
    }

    const logs = await models.LicenseLog.findAll({
        where: {
            licenseId: licenseId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });

    return res.send(logs);
}

export async function getUserLicenses(req: MedBlockRequest, res: Response): Promise<any> {
    const reqUser = req.user!;
    const userId = req.params.id ? parseInt(req.params.id) : reqUser.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    if (reqUser.role !== "admin" && reqUser.id !== userId) {
        return res.status(400).send("You are not allowed to view this user's licenses");
    }

    if (user.role !== "user" && user.role !== "doctor") {
        return res.status(400).send("Only patients and doctors can have licenses");
    }

    const licenses = await models.License.findAll({
        where: user.role === "user" ? { userId: userId, isActive: true } : { doctorId: userId, isActive: true },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    return res.send(licenses);
}

export async function getLicenseLogs(req: MedBlockRequest, res: Response): Promise<any> {
    const licenseLogs = await models.LicenseLog.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    });

    const licenseIds = licenseLogs.map(log => log.licenseId);
    const licenses = await models.License.findAll({
        where: { id: licenseIds }
    });

    const userIds = [
        ...new Set([
            ...licenses.map(license => license.userId),
            ...licenses.map(license => license.doctorId),
        ])
    ];
    const users = await models.User.findAll({
        where: { id: userIds }
    });

    const userMap = Object.fromEntries(users.map(user => [user.id, user]));
    const licenseMap = Object.fromEntries(licenses.map(license => [license.id, license]));

    const result = licenseLogs.map(log => {
        const license = licenseMap[log.licenseId];
        return {
            ...log.toJSON(),
            user: new UserResponse(userMap[license.userId]),
            doctor: new UserResponse(userMap[license.doctorId]),
            userId: undefined
        };
    });

    res.send(result);
}

export async function getDoctorsWithLicense(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    if (user.role !== "user") {
        return res.status(400).send("Only patients can view their doctors");
    }

    const licenses = await models.License.findAll({
        where: {
            userId,
            isActive: true
        }
    });

    const doctors = await Promise.all(licenses.map(async license => {
        const doctor = await models.User.findByPk(license.doctorId);
        if (!doctor) {
            return null;
        }
        return new UserResponse(doctor);
    }));

    return res.send(doctors);

}