import { Sequelize, DataTypes, Optional, Model } from 'sequelize';

export interface RecordTypeAttributes {
    id: number;
    name: string;
}

interface RecordTypeCreationAttributes extends Optional<RecordTypeAttributes, 'id'> {}

class RecordType extends Model<RecordTypeAttributes, RecordTypeCreationAttributes> implements RecordTypeAttributes {
    public id!: number;
    public name!: string;
}

export const initializeRecordType = (sequelize: Sequelize): typeof RecordType => {
    RecordType.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'RecordType',
        tableName: 'RecordTypes',
        timestamps: false,
    });

    return RecordType;
}
