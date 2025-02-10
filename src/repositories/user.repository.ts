import { InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/entities/user.entity';
import { RegisterDto } from 'src/dto/auth/register.dto';

export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: RegisterDto): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<UserDocument | undefined> {
    return await this.userModel.findOne({
      $and: [
        { deletedAt: null },
        { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] },
      ],
    });
  }

  async findUserById(id: string): Promise<UserDocument | undefined> {
    return await this.userModel.findOne({ _id: id, deletedAt: null });
  }

  async getUsers(): Promise<UserDocument[]> {
    return await this.userModel.find({ deletedAt: null });
  }

  async updateUser(
    id: string,
    updateUserDto: RegisterDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found');
    }

    return updatedUser;
  }

  async softDeleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { deletedAt: new Date() });
  }
}
