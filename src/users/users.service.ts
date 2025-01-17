import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { envs } from 'src/config';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor() {
    super({
      adapter: new PrismaLibSQL(
        createClient({
          url: envs.tursoDatabaseUrl,
          authToken: envs.tursoAuthToken,
        }),
      ),
    });
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createUserDto: CreateUserDto) {
    const { email, name, rfid } = createUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email,
        },
      });

      if (user) {
        return 'User already exists';
      }

      const newUser = await this.user.create({
        data: {
          email,
          name,
          rfid,
        },
      });

      return {
        user: newUser,
      };
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findAll() {
    return await this.user.findMany({
      where: {
        available: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { user } = await this.findOne(id);

      if (user.rfid === updateUserDto.rfid) {
        return user;
      }

      return this.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserDto,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async remove(id: string) {
    try {
      const { user } = await this.findOne(id);

      if (user.available === false) {
        return user;
      }

      return this.user.update({
        where: {
          id,
        },
        data: {
          available: false,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
