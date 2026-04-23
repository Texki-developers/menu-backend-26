import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = 'no-reply@menu.local';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.from = this.configService.get<string>('SMTP_FROM') ?? this.from;

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP_HOST/SMTP_USER/SMTP_PASS not fully configured — emails will be logged to console only.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async send(options: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[dev-mail] to=${options.to} subject="${options.subject}" ${options.text ?? ''}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const subject = 'Your verification code';
    const text = `Your verification code is ${code}. It expires in 5 minutes.`;
    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 420px;">
        <h2>Verify your email</h2>
        <p>Use this code to sign in:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p style="color:#6b7280; font-size: 13px;">This code expires in 5 minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `;
    await this.send({ to, subject, html, text });
  }
}
