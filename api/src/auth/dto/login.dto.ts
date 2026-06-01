import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  password: string;
}
