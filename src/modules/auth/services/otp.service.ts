import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { randomInt } from 'crypto';
import { EmailOtp } from '../schemas/email-otp.schema';
import { Branch } from '../../branches/schema/branches.schema';
import { PasswordUtils } from '../../../common/utils/password.utils';
import { MailerService } from './mailer.service';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

export interface VerifiedOtp {
  email: string;
  branch_id: Types.ObjectId;
  organization_id: Types.ObjectId;
}

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(EmailOtp.name) private readonly emailOtpModel: Model<EmailOtp>,
    @InjectModel(Branch.name) private readonly branchModel: Model<Branch>,
    private readonly mailer: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private getDevBypassCode(): string | null {
    const code = this.configService.get<string>('DEV_OTP_CODE');
    return code && code.trim() ? code.trim() : null;
  }

  async requestEmailOtp(email: string, branchId: string): Promise<void> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branch id');
    }
    const branch = await this.branchModel.findById(branchId).select('_id organization_id');
    if (!branch) throw new NotFoundException('Branch not found');

    const normalizedEmail = email.trim().toLowerCase();

    const recent = await this.emailOtpModel
      .findOne({ email: normalizedEmail, branch_id: branch._id })
      .sort({ created_at: -1 });

    if (recent && Date.now() - recent.created_at.getTime() < RESEND_COOLDOWN_MS) {
      throw new BadRequestException('Please wait before requesting a new code');
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const code_hash = await PasswordUtils.hash(code);

    await this.emailOtpModel.create({
      email: normalizedEmail,
      code_hash,
      branch_id: branch._id,
      organization_id: branch.organization_id,
      expires_at: new Date(Date.now() + OTP_TTL_MS),
    });

    await this.mailer.sendOtp(normalizedEmail, code);
  }

  async verifyEmailOtp(email: string, code: string, branchId: string): Promise<VerifiedOtp> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branch id');
    }
    const normalizedEmail = email.trim().toLowerCase();

    const otp = await this.emailOtpModel
      .findOne({
        email: normalizedEmail,
        branch_id: new Types.ObjectId(branchId),
        consumed: false,
        expires_at: { $gt: new Date() },
      })
      .sort({ created_at: -1 });

    if (!otp) throw new UnauthorizedException('Invalid or expired code');

    if (otp.attempts >= MAX_ATTEMPTS) {
      otp.consumed = true;
      await otp.save();
      throw new UnauthorizedException('Too many attempts — request a new code');
    }

    const devCode = this.getDevBypassCode();
    const matches =
      (devCode !== null && code === devCode) ||
      (await PasswordUtils.compare(code, otp.code_hash));
    if (!matches) {
      otp.attempts += 1;
      await otp.save();
      throw new UnauthorizedException('Invalid or expired code');
    }

    otp.consumed = true;
    await otp.save();

    return {
      email: normalizedEmail,
      branch_id: otp.branch_id,
      organization_id: otp.organization_id,
    };
  }
}
