import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

// Campos que se pueden devolver al cliente: nunca incluye password_hash
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

// Parámetros recomendados por OWASP para argon2id
export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} satisfies argon2.HashOptions;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  hashPassword(password: string) {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  verifyPassword(hash: string, password: string) {
    return argon2.verify(hash, password);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const passwordHash = await this.hashPassword(dto.password);
    try {
      return await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, passwordHash },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  // Uso interno (login): incluye el hash, nunca devolverlo tal cual
  findByEmailWithHash(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (
      !user ||
      !(await this.verifyPassword(user.passwordHash, dto.currentPassword))
    ) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await this.hashPassword(dto.newPassword) },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
