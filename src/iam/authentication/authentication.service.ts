import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'
import jwtConfig from '../config/jwt.config'
import { HashingService } from '../hashing/hashing.service'
import { ActiveUserData } from '../interfaces/active-user-data.interface'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'
import { OtpAuthenticationService } from './otp-authentication.service'
import {
	InvalidateRefreshTokenError,
	RefreshTokenIdsStorage,
} from './refresh-token-ids.storage/refresh-token-ids.storage'

@Injectable()
export class AuthenticationService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly hashingService: HashingService,
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfigurattion: ConfigType<typeof jwtConfig>,
		private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
		private readonly otpAuthenticationService: OtpAuthenticationService
	) {}

	async register(signUpDto: SignUpDto) {
		try {
			const user = new User()
			user.email = signUpDto.email
			user.password = await this.hashingService.hash(signUpDto.password)

			await this.usersRepository.save(user)
		} catch (error) {
			const pgUniqueViolationErrorCode = '23505'
			if (error.code === pgUniqueViolationErrorCode) {
				throw new ConflictException()
			}
			throw error
		}
	}

	async login(signInDto: SignInDto) {
		const user = await this.usersRepository.findOneBy({
			email: signInDto.email,
		})
		if (!user) {
			throw new UnauthorizedException('User does not exist!')
		}
		const isEqual = await this.hashingService.compare(signInDto.password, user.password)
		if (!isEqual) {
			throw new UnauthorizedException('Password does not match')
		}
		if (user.isTfaEnabled) {
			const isValid = this.otpAuthenticationService.verifyCode(
				signInDto.tfaCode, user.tfaSecret
			)
			if(!isValid) {
				throw new UnauthorizedException('Invalid 2FA code!')
			}
		}
		return await this.generateTokens(user)
	}

	async generateTokens(user: User) {
		const refreshTokenId = randomUUID()
		const [accessToken, refreshToken] = await Promise.all([
			this.signToken<Partial<ActiveUserData>>(user.id, this.jwtConfigurattion.accessTocenTtl, {
				email: user.email,
				role: user.role,
				//Warning
				permissions: user.permissions,
			}),
			this.signToken(user.id, this.jwtConfigurattion.refreshTokenTtl, { refreshTokenId }),
		])

		await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId)

		return {
			accessToken,
			refreshToken,
		}
	}

	async refreshTokens(refreshTokenDto: RefreshTokenDto) {
		try {
			const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
				Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
			>(refreshTokenDto.refreshToken, {
				secret: this.jwtConfigurattion.secret,
				audience: this.jwtConfigurattion.audience,
				issuer: this.jwtConfigurattion.issuer,
			})
			const user = await this.usersRepository.findOneByOrFail({
				id: sub,
			})
			const isValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId)

			if (isValid) {
				await this.refreshTokenIdsStorage.invalidate(user.id)
			} else {
				throw new Error('Refresh token is invalid!')
			}

			return this.generateTokens(user)
		} catch (error) {
			if (error instanceof InvalidateRefreshTokenError) {
				throw new UnauthorizedException('Access denied')
			}
			throw new UnauthorizedException()
		}
	}

	private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
		return await this.jwtService.signAsync(
			{
				sub: userId,
				...payload,
			},
			{
				audience: this.jwtConfigurattion.audience,
				issuer: this.jwtConfigurattion.issuer,
				secret: this.jwtConfigurattion.secret,
				expiresIn,
			}
		)
	}
}
