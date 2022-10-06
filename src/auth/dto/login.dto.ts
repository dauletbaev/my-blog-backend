import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
