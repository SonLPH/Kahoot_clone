import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnswerDTO } from './answer.dto';
import { Type } from 'class-transformer';

export class QuestionDTO {
  @ApiProperty({ type: Number, description: 'Question index' })
  @IsNotEmpty()
  @IsNumber()
  questionIndex: number;

  @ApiProperty({ type: String, description: 'Type of the question' })
  @IsNotEmpty()
  @IsString()
  questionType: string;

  @ApiProperty({ type: String, description: 'Type of point allocation' })
  @IsNotEmpty()
  @IsString()
  pointType: string;

  @ApiProperty({
    type: Number,
    description: 'Time allowed to answer in seconds',
  })
  @IsNotEmpty()
  @IsNumber()
  answerTime: number;

  @ApiProperty({ type: String, description: 'The question text' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    type: [AnswerDTO],
    isArray: true,
    description: 'List of possible answers',
    example: [
      { answer: '4', isCorrect: true },
      { answer: '3', isCorrect: false },
    ],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  answerList: AnswerDTO[];
}
