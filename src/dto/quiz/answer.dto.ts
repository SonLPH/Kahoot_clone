import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AnswerDTO {
  @ApiProperty({ type: String, description: 'The text of the answer' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({ type: Boolean, description: 'Whether this answer is correct' })
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}
