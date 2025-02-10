import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/entities/user.entity';
import { RegisterDto } from '../../dto/auth/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../../dto/auth/login.dto';
import { ILogin } from 'src/interfaces/login.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<User> {
    const { email, password } = registerDto;
    const existingUser = await this.userModel.findOne({
      $and: [
        {
          email: email,
        },
        {
          deletedAt: null,
        },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
    });
    const resUser = JSON.parse(JSON.stringify(newUser));
    delete resUser.password;

    return resUser;
  }

  private async convertJwtToString(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  public async login(loginDto: LoginDto): Promise<ILogin> {
    const { email, password } = loginDto;
    const existingUser = await this.userModel.findOne({
      $and: [
        {
          email: email,
        },
        { deletedAt: null },
      ],
    });
    if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
      return {
        access_token: await this.convertJwtToString(
          existingUser._id.toString(),
          email,
        ),
      };
    }

    throw new UnauthorizedException();
  }
}
