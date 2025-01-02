import { Sequelize, DataTypes, Model } from 'sequelize';

export interface LicenseAttributes {
    id: number;
    userId: number;
    doctorId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface LicenseCreationAttributes extends Omit<LicenseAttributes, 'id'> {}

export class License extends Model<LicenseAttributes, LicenseCreationAttributes> implements LicenseAttributes {
    public id!: number;
    public userId!: number;
    public doctorId!: number;
    public isActive!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

export const initializeLicense = (sequelize: Sequelize): typeof License => {
    License.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id',
        },
        doctorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'doctor_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'is_active',
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
        modelName: 'License',
        tableName: 'Licenses',
        timestamps: false,
    });

    return License;
}
