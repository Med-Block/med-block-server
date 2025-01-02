import e from 'express';
import { Sequelize, DataTypes, Model } from 'sequelize';

export type LicenseLogEvent = 'activate' | 'deactivate' | 'force_deactivate';

export interface LicenseLogAttributes {
    id: number;
    licenseId: number;
    userId: number;
    event: LicenseLogEvent;
    createdAt: Date;
    updatedAt: Date;
}

interface LicenseLogCreationAttributes extends Omit<LicenseLogAttributes, 'id'> {}

export class LicenseLog extends Model<LicenseLogAttributes, LicenseLogCreationAttributes> implements LicenseLogAttributes {
    public id!: number;
    public licenseId!: number;
    public userId!: number;
    public event!: LicenseLogEvent;
    public createdAt!: Date;
    public updatedAt!: Date;
}

export const initializeLicenseLog = (sequelize: Sequelize): typeof LicenseLog => {
    LicenseLog.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        licenseId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'license_id',
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        event: {
            type: DataTypes.ENUM<LicenseLogEvent>("activate", "deactivate", "force_deactivate"),
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
        modelName: 'LicenseLog',
        tableName: 'LicenseLogs',
        timestamps: false,
    });

    return LicenseLog;
}