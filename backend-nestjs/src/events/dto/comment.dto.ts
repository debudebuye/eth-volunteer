import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Great event! Looking forward to it.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;
}

export class AddReplyDto {
  @ApiProperty({ example: 'Thank you for your interest!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;
}
