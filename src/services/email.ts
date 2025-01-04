import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const EmailTemplatePath = path.join(__dirname, '../EmailTemplates');
export const EmailTemplates = {
    Register: 'register.html',
    RestPassword: 'restPassword.html'
};
export async function sendEmail(email: string, template: string, data?: any) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let html = fs.readFileSync(path.join(EmailTemplatePath, template), 'utf8');

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
    }

    const subject = /<title>(.*?)<\/title>/g.exec(html) || ['MedBlock'];
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject[1],
        html: html
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
