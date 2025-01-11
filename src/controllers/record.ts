import { Request, Response } from 'express';
import { models } from '../services/db';
import { MedBlockRequest } from "../requests";
import { RecordResponse } from '../response/record';
import { createBlock } from '../services/blockchain';
import crypto from 'crypto';

export async function addRecord(req: MedBlockRequest, res: Response): Promise<any> {
    const doctorId = req.user!.id;
    const userId = req.body.userId;
    const title = req.body.title;
    const type = req.body.type;
    const description = req.body.description;

    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    const doctor = await models.User.findByPk(doctorId);
    if (!doctor) {
        return res.status(404).send("Doctor not found");
    }

    const license = await models.License.findOne({
        where: {
            userId: userId,
            doctorId: doctorId,
            isActive: true
        }
    });
    if (!license) {
        return res.status(400).send("Doctor has no access to manage this patient's records");
    }

    const typeExists = await models.RecordType.findByPk(type);
    if (!typeExists) {
        return res.status(404).send("Record type not found");
    }

    if(user.role !== "user") {
        return res.status(400).send("Only patients can have records");
    }

    if(doctor.role !== "doctor") {
        return res.status(400).send("Only doctors can add records");
    }

    if(!title || title === "") {
        return res.status(400).send("Title is required");
    }
    if(title.length > 100) {
        return res.status(400).send("Title is too long (max 100 characters)");
    }

    if(!description || description === "") {
        return res.status(400).send("Description is required");
    }
    if(description.length > 8000) {
        return res.status(400).send("Description is too long (max 8000 characters)");
    }

    const record = await models.Record.create({
        patientId: userId,
        doctorId: doctorId,
        title: title,
        diagnosis: description,
        type: type,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Add to blockchain
    createBlock({
        event: 'RECORD_CREATED',
        recordId: record.id,
        patientId: userId,
        doctorId: doctorId,
        diagnosisHash: crypto.createHash('sha256').update(description).digest('hex'),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });

    return res.status(200).send(new RecordResponse(record));
}

export async function updateRecord(req: MedBlockRequest, res: Response): Promise<any> {
    const doctorId = req.user!.id;
    const recordId = req.params.recordId;
    const title = req.body.title;
    const type = req.body.type;
    const description = req.body.description;

    const record = await models.Record.findByPk(recordId);
    if (!record) {
        return res.status(404).send("Record not found");
    }

    if(record.doctorId !== doctorId) {
        return res.status(403).send("You are not allowed to update this record");
    }

    const typeExists = await models.RecordType.findByPk(type);
    if (!typeExists) {
        return res.status(404).send("Record type not found");
    }

    if(!title || title === "") {
        return res.status(400).send("Title is required");
    }
    if(title.length > 100) {
        return res.status(400).send("Title is too long (max 100 characters)");
    }

    if(!description || description === "") {
        return res.status(400).send("Description is required");
    }
    if(description.length > 8000) {
        return res.status(400).send("Description is too long (max 8000 characters)");
    }

    record.title = title;
    record.diagnosis = description;
    record.type = type;
    record.updatedAt = new Date();
    await record.save();

    // Update blockchain
    createBlock({
        event: 'RECORD_UPDATED',
        recordId: record.id,
        patientId: record.patientId,
        doctorId: doctorId,
        diagnosisHash: crypto.createHash('sha256').update(description).digest('hex'),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });

    return res.status(200).send(new RecordResponse(record));
}

export async function getRecord(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const recordId = req.params.recordId;

    const record = await models.Record.findByPk(recordId);
    if (!record) {
        return res.status(404).send("Record not found");
    }

    if(record.patientId !== userId && record.doctorId !== userId) {
        return res.status(403).send("You are not allowed to view this record details");
    }

    return res.send(new RecordResponse(record));
}

export async function getRecordList(req: MedBlockRequest, res: Response): Promise<any> {
    const userId = req.user!.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }

    if(user.role === "user") {
        return res.send(await getUserRecords(userId));
    } else if(user.role === "doctor") {
        const patientId = req.params.userId ? parseInt(req.params.userId) : null;
        if (!patientId) {
            return res.status(400).send("Patient ID is required");
        }

        const license = await models.License.findOne({
            where: {
                userId: patientId,
                doctorId: userId,
                isActive: true
            }
        });
        if (!license) {
            return res.status(400).send("Doctor has no access to manage this patient's records");
        }

        return res.send(await getUserRecords(patientId));
    } else {
        return res.status(400).send("Only patients and doctors can have records");
    }
}

async function getUserRecords(userId: number): Promise<RecordResponse[]> {
    const records = await models.Record.findAll({
        where: {
            patientId: userId,
        },
        order: [
            ['createdAt', 'DESC'],
        ],
    });

    return records.map(record => new RecordResponse(record));
}