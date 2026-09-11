import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
	imports: [
		UsersModule, // pour accéder a `usersService.create` de register()
		ConfigModule, // permet de lire dynamiquement les variables du .env
		PassportModule,  // active le système générique de stratégies d'authentification
		JwtModule.registerAsync({
			imports: [ ConfigModule ], // JwtModule a besoin d'accéder à ConfigModule
			inject: [ ConfigService ], // ConfigService sera injecté (instanciê) dans useFactory
			// factory appelée au démarrage pour construire la config du JwtModule
			useFactory: ( config: ConfigService ) => ({ 
				secret: config.getOrThrow<string>( 'JWT_SECRET' ), // clé utilisée pour signer/vérifier les tokens
				signOptions: { expiresIn: parseInt( config.getOrThrow<string>('JWT_EXPIRATION'), 10 ) }, // durée de validité d'un token ; parseInt ~ atoi()
			}),
		}), 
	],
	controllers: [ AuthController ],
	providers: [ AuthService, JwtStrategy, GoogleStrategy ],
	exports: [ JwtModule ] // rend JwtService disponible pour les modules qui importeront AuthModule
})
export class AuthModule {}
