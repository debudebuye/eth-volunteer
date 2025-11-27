import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Community Cleanup Drive' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Join us for a community cleanup event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2025-12-01T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'ngo@example.com' })
  @IsEmail()
  @IsNotEmpty()
  creatorEmail: string;

  @ApiProperty({ example: 'Help Ethiopia NGO' })
  @IsString()
  @IsNotEmpty()
  creatorName: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;
}
