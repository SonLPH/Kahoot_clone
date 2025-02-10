import { InjectConnection } from '@nestjs/mongoose';
import { QuizService } from './quiz.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Connection } from 'mongoose';
import sendResponse from 'src/utils/send-response';
import { CreateQuizDTO } from 'src/dto/quiz/create-quiz.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateQuizDto } from 'src/dto/quiz/update-quiz.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { ApiQuery } from '@nestjs/swagger';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly quizService: QuizService,
  ) {}

  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of quizzes per page',
    example: 3,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'keywork',
    required: false,
    description: 'Keyword to search quizzes by title',
    example: 'sample',
  })
  @Get()
  async findAll(
    @Query() query: ExpressQuery,
    @Req() request: any,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Quizzes retrieved successfully',
      await this.quizService.findAll(query, request.user.userId),
      null,
    );
  }

  @Get('/:id')
  async findOne(@Res() response: Response, @Param('id') id: string) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Quiz retrieved successfully',
      await this.quizService.findOne(id),
      null,
    );
  }

  @Post()
  async createQuiz(
    @Body() newQuiz: CreateQuizDTO,
    @Req() request: any,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.CREATED,
      'Quiz created successfully',
      await this.quizService.createQuiz(newQuiz, request.user.userId),
      null,
    );
  }

  @Put('/:id')
  async updateQuiz(
    @Param('id') id: string,
    @Body() updatedQuiz: UpdateQuizDto,
    @Req() request: any,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Quiz updated successfully',
      await this.quizService.updateQuiz(id, updatedQuiz, request.user.userId),
      null,
    );
  }

  @Delete('/:id')
  async deleteQuiz(
    @Req() request: any,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    return sendResponse(
      response,
      HttpStatus.NO_CONTENT,
      'Quiz deleted successfully',
      await this.quizService.deleteQuiz(id, request.user.userId),
      null,
    );
  }
}
