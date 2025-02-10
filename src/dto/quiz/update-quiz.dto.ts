import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionDTO } from './question.dto';
import { Type } from 'class-transformer';

export class UpdateQuizDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
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
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questionList: QuestionDTO[];
}
