import { Record } from '../models/db/record';

export class RecordResponse {
    id: number;
    patientId: number;
    doctorId: number;
    type: number;
    title: string;
    diagnosis: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(record: Record) {
        this.id = record.id;
        this.patientId = record.patientId;
        this.doctorId = record.doctorId;
        this.type = record.type;
        this.title = record.title;
        this.diagnosis = record.diagnosis;
        this.createdAt = record.createdAt;
        this.updatedAt = record.updatedAt;
    }
}