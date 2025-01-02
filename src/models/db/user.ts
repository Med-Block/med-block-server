import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type UserRole = 'admin' | 'user' | 'doctor';

export interface UserAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    position?: string;
    isBlocked?: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public password!: string;
    public role!: UserRole;
    public position!: string;
    public isBlocked!: boolean;
}

export const initializeUser = (sequelize: Sequelize): typeof User => {
    User.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM<UserRole>("admin", "user", "doctor"),
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        isBlocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_blocked',
        },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: false,
    });

    return User;
}