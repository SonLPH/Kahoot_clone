import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from 'src/entities/user.entity';
import { IPayload } from 'src/interfaces/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // For development purposes
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: IPayload) {
    const user = await this.userModel.findById(payload.sub).lean();
    delete user.password;
    return { userId: payload.sub, email: payload.email };
  }
}
