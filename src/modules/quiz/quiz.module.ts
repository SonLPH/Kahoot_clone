import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema } from 'src/entities/quiz.entity';
import { QuizService } from './quiz.service';
import { QuizRepository } from 'src/repositories/quiz.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService, QuizRepository],
})
export class QuizModule {}
