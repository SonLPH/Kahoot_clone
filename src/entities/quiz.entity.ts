import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.entity';

export type QuizDocument = Quiz & Document;

@Schema()
export class Answer {
  @Prop({ required: true })
  answer: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema()
export class Question {
  @Prop({ required: true })
  questionType: string;

  @Prop({ required: true })
  pointType: string;

  @Prop({ required: true })
  answerTime: number;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [AnswerSchema], required: true })
  answerList: Answer[];

  @Prop({ required: true })
  questionIndex: number;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ collection: 'quizzes', timestamps: true })
export class Quiz extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  author: User;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [QuestionSchema], required: true })
  questionList: Question[];

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
