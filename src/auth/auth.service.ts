import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import {
  ARGON2_OPTIONS,
  PublicUser,
  UsersService,
} from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  // Hash señuelo: iguala el tiempo de respuesta cuando el email no existe
  // para que no se pueda averiguar qué emails están registrados
  private readonly dummyHash = argon2.hash(
    'dummy-password-for-timing',
    ARGON2_OPTIONS,
  );

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    return { accessToken: await this.sign(user), user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithHash(dto.email);
    if (!user) {
      await argon2.verify(await this.dummyHash, dto.password);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await this.usersService.verifyPassword(
      user.passwordHash,
      dto.password,
    );
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return { accessToken: await this.sign(publicUser), user: publicUser };
  }

  private sign(user: PublicUser) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwt.signAsync(payload);
  }
}
