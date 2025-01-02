import { Sequelize } from "sequelize";
import { initializeUser, initializeLicense, initializeLicenseLog, initializeRecord, initializeRecordType } from "../models/db";
import * as hash from "../utils/hash";

export const db = new Sequelize({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
});

export const models = {
    User: initializeUser(db),
    Record: initializeRecord(db),
    RecordType: initializeRecordType(db),
    License: initializeLicense(db),
    LicenseLog: initializeLicenseLog(db),
};

export const init = async () => {
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
        // User
        models.User.hasMany(models.Record, { foreignKey: 'patientId' });
        models.Record.belongsTo(models.User, { foreignKey: 'patientId' });
        models.User.hasMany(models.Record, { foreignKey: 'doctorId' });
        models.Record.belongsTo(models.User, { foreignKey: 'doctorId' });
        // Record
        models.Record.belongsTo(models.RecordType, { foreignKey: 'type' });
        models.RecordType.hasMany(models.Record, { foreignKey: 'type' });
        // License
        models.User.hasMany(models.License, { foreignKey: 'userId' });
        models.License.belongsTo(models.User, { foreignKey: 'userId' });
        models.User.hasMany(models.License, { foreignKey: 'doctorId' });
        models.License.belongsTo(models.User, { foreignKey: 'doctorId' });
        // LicenseLog
        models.License.hasMany(models.LicenseLog, { foreignKey: 'licenseId' });
        models.LicenseLog.belongsTo(models.License, { foreignKey: 'licenseId' });
        models.User.hasMany(models.LicenseLog, { foreignKey: 'userId' });
        models.LicenseLog.belongsTo(models.User, { foreignKey: 'userId' });

        await db.sync();

        console.log('All models were synchronized successfully.');

        if ((await models.User.count()) === 0) {
            await models.User.bulkCreate([
                {
                    email: "test1@gmail.com",
                    password: hash.calculate("password"),
                    role: 'admin',
                    firstName: "Artem",
                    lastName: "TestUser1",
                    isBlocked: false
                },
                {
                    email: "test2@gmail.com",
                    password: hash.calculate("password"),
                    role: 'doctor',
                    firstName: "Keril",
                    lastName: "TestUser2",
                    isBlocked: false
                },
                {
                    email: "test3@gmail.com",
                    password: hash.calculate("password"),
                    role: 'user',
                    firstName: "Oleksey",
                    lastName: "TestUser3",
                    isBlocked: false
                }
            ]);
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}