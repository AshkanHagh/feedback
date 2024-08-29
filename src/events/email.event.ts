import { EventEmitter } from 'node:events';
import { sendEmail } from '../utils';

export const emailEvent = new EventEmitter();

emailEvent.on('admin-comment-added', async (email : string, ticketTitle : string, ticketLink : string) => {
    await sendEmail({
      email,
      subject : 'New Comment on Your Support Ticket',
      text : `Your support ticket "${ticketTitle}" has received a new comment from our support team. Please check the details: ${ticketLink}`,
      html : `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 40px; border-radius: 10px;">
          <h2 style="color: #000; text-align: center; font-size: 24px; margin-bottom: 30px;">New Comment on Your Support Ticket</h2>
          <p style="text-align: center; font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Dear User,<br>We wanted to let you know that our support team has added a new comment to your ticket titled "<strong>${ticketTitle}</strong>".
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketLink}" style="display: inline-block; padding: 15px 30px; font-size: 18px; color: #fff; background-color: #333; text-decoration: none; border-radius: 30px; transition: background-color 0.3s ease;">
              View Comment
            </a>
          </div>
          <p style="text-align: center; font-size: 16px; color: #333; margin-top: 40px;">
            If you have any further questions or concerns, please don't hesitate to <a href="#" style="color: #333; text-decoration: none;">contact us</a>.
          </p>
          <p style="text-align: center; font-size: 16px; color: #333; margin-top: 20px;">
            Best regards,<br><strong>Feedback Support Team</strong>
          </p>
        </div>
      `
    });
});

emailEvent.on('ticket-status-changed', async (email : string, ticketTitle : string, ticketLink : string, status : string) => {
  await sendEmail({
    email,
    subject : 'Your Support Ticket Status Updated',
    text : `Your support ticket "${ticketTitle}" has been updated to "${status}". Please check the details: ${ticketLink}`,
    html : `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 40px; border-radius: 10px;">
        <h2 style="color: #000; text-align: center; font-size: 24px; margin-bottom: 30px;">Support Ticket Status Updated</h2>
        <p style="text-align: center; font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear User,<br>We wanted to let you know that your ticket titled "<strong>${ticketTitle}</strong>" has been updated to "<strong>${status}</strong>".
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ticketLink}" style="display: inline-block; padding: 15px 30px; font-size: 18px; color: #fff; background-color: #333; text-decoration: none; border-radius: 30px; transition: background-color 0.3s ease;">
            View Ticket
          </a>
        </div>
        <p style="text-align: center; font-size: 16px; color: #333; margin-top: 40px;">
          If you have any further questions or concerns, please don't hesitate to <a href="#" style="color: #333; text-decoration: none;">contact us</a>.
        </p>
        <p style="text-align: center; font-size: 16px; color: #333; margin-top: 20px;">
          Best regards,<br><strong>Feedback Support Team</strong>
        </p>
      </div>
    `
  });
});