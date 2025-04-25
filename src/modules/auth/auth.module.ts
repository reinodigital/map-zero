import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { Auth } from './entities/auth.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get('JWT_SECRET');
        if (!jwtSecret) throw new Error('Environment JWT variable is missing');

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '20h',
          },
        };
      },
    }),

    TypeOrmModule.forFeature([Auth]),
  ],
  exports: [TypeOrmModule, PassportModule, JwtModule, JwtStrategy],
})
export class AuthModule {}
