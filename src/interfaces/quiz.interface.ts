import { Quiz } from 'src/entities/quiz.entity';
import { User } from 'src/entities/user.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { CreateQuizDTO } from 'src/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from 'src/dto/quiz/update-quiz.dto';

export interface QuizInterface {
  findAll(query: ExpressQuery): Promise<Quiz[]>;
  findOne(id: string): Promise<Quiz>;
  create(newQuiz: CreateQuizDTO, user: User): Promise<Quiz>;
  update(id: string, updatedQuiz: UpdateQuizDto, user: User): Promise<Quiz>;
  delete(id: string): Promise<Quiz>;
}
