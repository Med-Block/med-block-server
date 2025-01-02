import { Sequelize, DataTypes, Model } from 'sequelize';

export interface RecordAttributes {
    id: number;
    patientId: number;
    doctorId: number;
    type: number;
    title: string;
    diagnosis: string;
    createdAt: Date;
    updatedAt: Date;
}

interface RecordCreationAttributes extends Omit<RecordAttributes, 'id'> {}

export class Record extends Model<RecordAttributes, RecordCreationAttributes> implements RecordAttributes {
    public id!: number;
    public patientId!: number;
    public doctorId!: number;
    public type!: number;
    public title!: string;
    public diagnosis!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

export const initializeRecord = (sequelize: Sequelize): typeof Record => {
    Record.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        patientId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'patient_id',
        },
        doctorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'doctor_id'
        },
        type: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        diagnosis: {
            type: DataTypes.STRING(8000),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at',
        },
    }, {
        sequelize,
        modelName: 'Record',
        tableName: 'Records',
        timestamps: false,
    });

    return Record;
}