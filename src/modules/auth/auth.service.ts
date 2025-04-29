import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions, ILike, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Auth } from './entities/auth.entity';

import { CreateAuthDto, LoginAuthDto, UpdateAuthDto } from './dto';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ICountAndAuthAll, IMessage } from 'src/interfaces/index';
import { SecurityRoles } from 'src/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    private readonly jwtService: JwtService, // default Nest Service to generate JWT
  ) {}

  // Create a USER
  async create(createAuthDto: CreateAuthDto): Promise<IMessage> {
    const { password, email, mobile, roles, ...restUser } = createAuthDto;

    try {
      const userWithEmail = await this.authRepository.findOneBy({ email });
      if (userWithEmail) {
        throw new BadRequestException(
          `Empleado con correo: ${userWithEmail.email} ya existe.`,
        );
      }

      const userWithMobile = await this.authRepository.findOneBy({ mobile });
      if (userWithMobile) {
        throw new BadRequestException(
          `Empleado con teléfono: ${userWithMobile.mobile} ya existe.`,
        );
      }

      const newUser = this.authRepository.create({
        email,
        mobile,
        password: bcrypt.hashSync(password, 10),
        roles,
        ...restUser,
      });

      await this.authRepository.save(newUser);

      return {
        msg: 'Empleado creado correctamente.',
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // Login User
  async login(loginAuthDto: LoginAuthDto) {
    const { password, email } = loginAuthDto;

    try {
      const user = await this.authRepository.findOneBy({ email });
      if (!user) {
        throw new UnauthorizedException('Empleado no existe');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Empleado no se encuentra activo.');
      }

      const { password: passwordDB, isActive, uid, ...restUser } = user;

      // Verify password
      const isValidPassword = bcrypt.compareSync(password, passwordDB);
      if (!isValidPassword) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      return {
        ...restUser,
        uid,
        token: this.generateJWT({ uid: uid.toString() }),
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // revalidateToken
  async revalidateToken(user: Auth) {
    return {
      ...user,
      token: this.generateJWT({ uid: user.uid.toString() }),
    };
  }

  // RETRIEVE ALL USERS from DB from ADMIN
  async findAll(findAllUsersDto: FindAllUsersDto): Promise<ICountAndAuthAll> {
    const {
      limit = 10,
      offset = 0,
      name,
      email,
      mobile,
      role,
      status,
    } = findAllUsersDto;

    try {
      const findOptions: FindManyOptions<Auth> = {
        take: limit,
        skip: offset,
        select: ['uid', 'email', 'mobile', 'name', 'roles', 'isActive'],
        order: {
          uid: 'DESC',
        },
      };

      const whereConditions: any = {};
      if (name) {
        whereConditions.name = ILike(`%${name}%`);
      }

      if (email) {
        whereConditions.email = ILike(`%${email}%`);
      }

      if (mobile) {
        whereConditions.mobile = ILike(`%${mobile}%`);
      }

      if (role) {
        whereConditions.roles = role;
      }

      if (status) {
        const isActive = status === 'active' ? true : false;
        whereConditions.isActive = isActive;
      }

      if (Object.keys(whereConditions).length) {
        findOptions.where = whereConditions;
      }

      const [users, total] =
        await this.authRepository.findAndCount(findOptions);

      return {
        count: total,
        users,
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const user = await this.authRepository.findOneBy({ uid: id });
      if (!user) throw new BadRequestException(`User with ID: ${id} not found`);

      return user;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // UPDATE ONE USER BY ID
  async update(id: number, updateAuthDto: UpdateAuthDto) {
    const { password, email, roles, ...restUpdateUser } = updateAuthDto;

    try {
      const oldUser = await this.findOne(id);

      const updatedUser = await this.authRepository.preload({
        uid: oldUser.uid,
        ...restUpdateUser,
        email: email ? email : oldUser.email,
        password: password ? bcrypt.hashSync(password, 10) : oldUser.password,
      });

      await this.authRepository.save(updatedUser!);

      return {
        msg: 'Empleado actualizado correctamente',
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const user = await this.authRepository.findOneBy({ uid: id });
      if (!user) {
        throw new BadRequestException(
          `Empleado con id: ${id} no existe en base datos.`,
        );
      }

      await this.authRepository.update({ uid: id }, { isActive: false });

      return {
        msg: 'Empleado es puesto inactivo exitosamente.',
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findSellers() {
    try {
      const sellers = await this.authRepository.find({
        where: {
          roles: Like(`%${SecurityRoles.SELLER}%`),
        },
        select: ['uid', 'name'],
      });

      return sellers;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // ----------------- HELPERS --------------------

  private generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private handleErrorsOnDB(err: any): never {
    if (err.status === 400) {
      throw new BadRequestException(err.response.message);
    }
    if (err.status === 401) {
      throw new UnauthorizedException(err.response.message);
    }
    if (err.errno === 1062) {
      throw new BadRequestException(
        'Ese correo o teléfono ya existe en otro empleado, rectifique bien.',
      );
    }
    if (err.errno === 1052) {
      throw new BadRequestException(err.sqlMessage);
    }

    throw new InternalServerErrorException(
      `Error not handled yet at AuthService. Error: ${err}`,
    );
  }
}
