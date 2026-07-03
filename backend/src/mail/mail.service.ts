import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../users/user.entity';
import {
  newsletterTemplate,
  orderConfirmationTemplate,
  orderStatusTemplate,
  passwordResetTemplate,
  welcomeTemplate,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private transporter: nodemailer.Transporter;
  private readonly storeUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      // Dev fallback: emails are serialized to the console instead of sent
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      this.logger.warn('SMTP not configured — emails will be logged, not sent');
    }
  }

  private async send(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"Klass Computer" <noreply@klasscomputer.cm>',
        to,
        subject,
        html,
      });
      if ((info as any).message) {
        this.logger.log(`[dev-mail] to=${to} subject="${subject}"`);
      }
    } catch (error) {
      this.logger.error(`Failed to send mail to ${to}: ${(error as Error).message}`);
    }
  }

  sendWelcome(user: User) {
    return this.send(
      user.email,
      'Welcome to Klass Computer 🎉',
      welcomeTemplate(user.firstName, this.storeUrl),
    );
  }

  sendOrderConfirmation(email: string, order: any) {
    return this.send(
      email,
      `Order confirmed — ${order.orderNumber}`,
      orderConfirmationTemplate(order, this.storeUrl),
    );
  }

  sendOrderStatusUpdate(email: string, order: any) {
    return this.send(
      email,
      `Your order ${order.orderNumber} is ${order.status}`,
      orderStatusTemplate(order, this.storeUrl),
    );
  }

  sendPasswordReset(user: User, token: string) {
    const resetUrl = `${this.storeUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    return this.send(user.email, 'Reset your Klass Computer password', passwordResetTemplate(resetUrl));
  }

  sendNewsletterConfirmation(email: string) {
    return this.send(
      email,
      'Welcome to the Klass Computer newsletter',
      newsletterTemplate(this.storeUrl),
    );
  }
}
