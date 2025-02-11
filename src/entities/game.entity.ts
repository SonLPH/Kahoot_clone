import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.entity';
import { Quiz } from './quiz.entity';

export type GameDocument = Game & Document;

export enum GameState {
  WAITING = 'waiting',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Schema({ collection: 'games', timestamps: true })
export class Game extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  hostId: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'quizzes',
    required: true,
  })
  quizId: Quiz;

  @Prop({ required: true, unique: true })
  pin: string;

  @Prop({ type: String, enum: GameState, default: GameState.WAITING })
  state: GameState;

  @Prop({
    type: [
      {
        playerName: { type: String },
        score: { type: Number, default: 0 },
        results: {
          type: [
            {
              questionIndex: { type: Number },
              isAnswered: { type: Boolean },
              answer: { type: String },
              time: { type: Number },
              points: { type: Number, default: 0 },
            },
          ],
          default: [],
        },
        currentQuestionIndex: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  players: Record<string, any>[];

  @Prop({ default: -1 })
  currentQuestionIndex: number;

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const GameSchema = SchemaFactory.createForClass(Game);
