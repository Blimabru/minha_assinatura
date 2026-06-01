import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  id?: string; // ID opcional (se gerado pelo WatermelonDB)

  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  currencyPreference?: string;
}
