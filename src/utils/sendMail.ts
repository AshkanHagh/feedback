import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

type MailOption = {
    subject : string; text : string; email : string; html : string;
}

export const sendEmail = async (option : MailOption) : Promise<void> => {
    const transport : nodemailer.Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
        host : process.env.SMTP_HOST, 
        port : process.env.SMTP_PORT || 25, 
        service : process.env.SMTP_SERVICE,
        auth : {
            user : process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASSWORD
        }
    });
    await transport.sendMail({from : process.env.SMTP_MAIL, to : option.email, subject : option.subject, html : option.html});
}