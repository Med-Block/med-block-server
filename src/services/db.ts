import { Sequelize } from "sequelize";
import { initializeUser, Record, RecordType, Licence } from "../models/db";
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
    Record: Record(db),
    RecordType: RecordType(db),
    Licence: Licence(db),
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
        // Licence
        models.User.hasMany(models.Licence, { foreignKey: 'userId' });
        models.Licence.belongsTo(models.User, { foreignKey: 'userId' });
        models.User.hasMany(models.Licence, { foreignKey: 'docroId' });
        models.Licence.belongsTo(models.User, { foreignKey: 'docroId' });

        await db.sync();

        console.log('All models were synchronized successfully.');

        if ((await models.User.count()) === 0) {
            await models.User.bulkCreate([
                {
                    email: "test1@gmail.com",
                    password: hash.calculate("password"),
                    role: 'user',
                    firstName: "Artem",
                    lastName: "TestUser1",
                    isBlocked: false
                },
                {
                    email: "test2@gmail.com",
                    password: hash.calculate("password"),
                    role: 'user',
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