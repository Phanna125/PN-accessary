import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly adminEmail = (
    process.env.ADMIN_EMAIL ?? 'phanna38254@gmail.com'
  )
    .trim()
    .toLowerCase();

  private readonly adminPassword = process.env.ADMIN_PASSWORD ?? 'Phanna8$';

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    if (this.isReservedAdminEmail(email)) {
      if (dto.password !== this.adminPassword) {
        throw new BadRequestException(
          'This email is reserved for the admin account',
        );
      }
      return this.ensureReservedAdminUser();
    }

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        role: Role.CUSTOMER,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    if (this.isReservedAdminEmail(email)) {
      await this.ensureReservedAdminUser();
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  private isReservedAdminEmail(email: string) {
    return email === this.adminEmail;
  }

  private async ensureReservedAdminUser() {
    const existing = await this.prisma.user.findUnique({
      where: { email: this.adminEmail },
      select: { id: true, email: true, role: true, createdAt: true, passwordHash: true },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(this.adminPassword, 10);
      return this.prisma.user.create({
        data: {
          email: this.adminEmail,
          passwordHash,
          role: Role.ADMIN,
        },
        select: { id: true, email: true, role: true, createdAt: true },
      });
    }

    const passwordMatches = await bcrypt.compare(
      this.adminPassword,
      existing.passwordHash,
    );

    if (existing.role === Role.ADMIN && passwordMatches) {
      return {
        id: existing.id,
        email: existing.email,
        role: existing.role,
        createdAt: existing.createdAt,
      };
    }

    const data: { role: Role; passwordHash?: string } = { role: Role.ADMIN };
    if (!passwordMatches) {
      data.passwordHash = await bcrypt.hash(this.adminPassword, 10);
    }

    return this.prisma.user.update({
      where: { id: existing.id },
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }
}

