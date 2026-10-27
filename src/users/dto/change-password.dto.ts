import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { STRONG_PASSWORD } from '../../common/transforms.js';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD, {
    message:
      'newPassword debe contener al menos una minúscula, una mayúscula y un número',
  })
  newPassword: string;
}
