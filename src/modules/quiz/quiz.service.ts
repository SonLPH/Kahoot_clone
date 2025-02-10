import { Quiz } from 'src/entities/quiz.entity';
import { QuizRepository } from 'src/repositories/quiz.repository';
import { Injectable } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { CreateQuizDTO } from 'src/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from 'src/dto/quiz/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  async findAll(query: ExpressQuery, userId: string): Promise<any> {
    return await this.quizRepository.findAll(query, userId);
  }

  async findOne(id: string): Promise<Quiz> {
    return await this.quizRepository.findOne(id);
  }

  async createQuiz(newQuiz: CreateQuizDTO, userId: string): Promise<Quiz> {
    return await this.quizRepository.create(newQuiz, userId);
  }

  async updateQuiz(
    id: string,
    updatedQuiz: UpdateQuizDto,
    userId: string,
  ): Promise<Quiz> {
    console.log(userId);
    return await this.quizRepository.update(id, updatedQuiz, userId);
  }

  async deleteQuiz(id: string, userId: string): Promise<void> {
    await this.quizRepository.delete(id, userId);
  }
}
