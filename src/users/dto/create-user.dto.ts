import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  NormalizeEmail,
  STRONG_PASSWORD,
  Trim,
} from '../../common/transforms.js';

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  // Máximo 128 para evitar DoS hasheando cadenas enormes
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD, {
    message:
      'password debe contener al menos una minúscula, una mayúscula y un número',
  })
  password: string;
}
