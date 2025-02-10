import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionDTO } from './question.dto';

export class CreateQuizDTO {
  @ApiProperty({ type: String, description: 'Title of the quiz' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    type: [QuestionDTO],
    isArray: true,
    description: 'Array of questions',
    example: [
      {
        questionType: 'multiple-choice',
        pointType: 'standard',
        answerTime: 30,
        question: 'What is 2 + 2?',
        questionIndex: 1,
        answerList: [
          { answer: '4', isCorrect: true },
          { answer: '3', isCorrect: false },
        ],
      },
    ],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questionList: QuestionDTO[];
}
