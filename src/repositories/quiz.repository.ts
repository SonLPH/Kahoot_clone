import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Quiz, QuizDocument } from 'src/entities/quiz.entity';
import { UpdateQuizDto } from 'src/dto/quiz/update-quiz.dto';
import { CreateQuizDTO } from 'src/dto/quiz/create-quiz.dto';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
  ) {}

  async findAll(query: ExpressQuery, userId: string): Promise<any> {
    const pageSize =
      query.pageSize && Number(query.pageSize) > 0
        ? Number(query.pageSize)
        : 10;
    const currentPage =
      query.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const skip = currentPage > 0 ? pageSize * (currentPage - 1) : 0;

    const keywork = query.keywork
      ? {
          title: {
            $regex: query.keywork,
            $options: 'i',
          },
          author: userId,
        }
      : {
          author: userId,
        };

    const totalQuizzes = await this.quizModel
      .countDocuments({ ...keywork })
      .exec();

    const quizzes = await this.quizModel
      .find({ ...keywork })
      .limit(pageSize)
      .skip(skip)
      .exec();

    const totalPages = Math.ceil(totalQuizzes / pageSize);

    return {
      quizzes,
      currentPage,
      totalPages,
      totalQuizzes,
    };
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async create(newQuiz: CreateQuizDTO, userId: string): Promise<Quiz> {
    const quiz = Object.assign(newQuiz, { author: userId });

    const createdQuiz = new this.quizModel(quiz);

    return await createdQuiz.save();
  }

  async update(
    id: string,
    updateQuizDto: UpdateQuizDto,
    userId: string,
  ): Promise<Quiz> {
    if (!(await this.validateAuthor(id, userId))) {
      throw new ForbiddenException('Not authorized to update this quiz');
    }

    const updateData = {
      ...updateQuizDto,
      author: userId,
    };

    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedQuiz;
  }

  async delete(id: string, userId: string): Promise<void> {
    if (!(await this.validateAuthor(id, userId))) {
      throw new ForbiddenException('Not authorized to delete this quiz');
    }

    await this.quizModel.findByIdAndDelete(id, { deletedAt: new Date() });
  }

  async validateAuthor(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.quizModel.findById(quizId).exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz.author.toString() === userId;
  }
}
