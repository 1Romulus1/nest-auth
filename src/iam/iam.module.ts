import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AuthenticationController } from './authentication/authentication.controller'
import { AuthenticationService } from './authentication/authentication.service'
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard'
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard'
import { OtpAuthenticationService } from './authentication/otp-authentication.service'
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage'
import { GoogleAuthenticationController } from './authentication/social/google-authentication.controller'
import { GoogleAuthenticationService } from './authentication/social/google-authentication.service'
import { PoliciesGuard } from './authorization/guards/roles/policies.guard'
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.storage'
import { PolicyHandlerStorage } from './authorization/policies/policy-handlers.storage'
import jwtConfig from './config/jwt.config'
import { BcryptService } from './hashing/bcrypt.service'
import { HashingService } from './hashing/hashing.service'

@Module({
	providers: [
		{
			provide: HashingService,
			useClass: BcryptService,
		},
		{
			provide: APP_GUARD,
			useClass: AuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PoliciesGuard, //PermissionsGuard, //RolesGuard
		},
		AccessTokenGuard,
		RefreshTokenIdsStorage,
		AuthenticationService,
		PolicyHandlerStorage,
		FrameworkContributorPolicyHandler,
		GoogleAuthenticationService,
		OtpAuthenticationService,
	],
	controllers: [AuthenticationController, GoogleAuthenticationController],
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(jwtConfig),
	],
})
export class IamModule {}
