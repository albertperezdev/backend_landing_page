import { IsEmail, IsString, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/transforms.js';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MaxLength(128)
  password: string;
}
