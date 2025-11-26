import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class RegisterNgoDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@ngo.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'Help Ethiopia NGO' })
  @IsString()
  @IsNotEmpty()
  organization: string;

  @ApiProperty({ example: 'We help communities', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://ngo.org', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: '+251911234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
