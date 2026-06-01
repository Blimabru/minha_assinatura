import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { id, name, email, password, currencyPreference } = registerDto;

    // Verifica se e-mail já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já está cadastrado');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
    const now = Date.now(); // Timestamp Unix em milissegundos para compatibilidade total com WatermelonDB

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        id: id || Math.random().toString(36).substring(2, 15), // Permite ID do cliente ou gera ID
        name,
        email,
        passwordHash,
        currencyPreference: currencyPreference || 'BRL',
        isAdmin: email === 'bru.no@outlook.com.br' || email.includes('admin'),
        isPremium: false,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Retorna token de acesso e dados do usuário
    const token = this.generateToken(user.id, user.email);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Compara senhas
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Emite token JWT
    const token = this.generateToken(user.id, user.email);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  async setPremiumStatus(userId: string, isPremium: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isPremium },
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
