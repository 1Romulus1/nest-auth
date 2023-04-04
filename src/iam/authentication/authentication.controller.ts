import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { toFileStream } from 'qrcode'
import { ActiveUser } from '../decorators/active-user.decorator'
import { ActiveUserData } from '../interfaces/active-user-data.interface'
import { AuthenticationService } from './authentication.service'
import { Auth } from './decorators/auth.decorator'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'
import { AuthType } from './enums/auth-type.enum'
import { OtpAuthenticationService } from './otp-authentication.service'

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
	constructor(
		private readonly authService: AuthenticationService,
		private readonly otpAuthenticationService: OtpAuthenticationService
	) {}

	@Post('register')
	register(@Body() signUpDto: SignUpDto) {
		return this.authService.register(signUpDto)
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	//через кукі
	// async login(@Res({passthrough: true}) response: Response, @Body() signInDto: SignInDto) {
	// 	const accessToken = await this.authService.login(signInDto)
	// 	response.cookie('accessToken', accessToken, {
	// 		secure: true,
	// 		httpOnly: true,
	// 		sameSite:true,
	// 	})
	// }

	//це для біль простого розуміння
	login(@Body() signInDto: SignInDto) {
		return this.authService.login(signInDto)
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh-tokens')
	refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshTokens(refreshTokenDto)
	}

	@Auth(AuthType.Bearer)
	@HttpCode(HttpStatus.OK)
	@Post('2fa/generate')
	async generateQrCode(@ActiveUser() activeUser: ActiveUserData, @Res() response: Response) {
		const { secret, uri } = await this.otpAuthenticationService.generateSecret(activeUser.email)
		await this.otpAuthenticationService.enableTfaForUser(activeUser.email, secret)
		response.type('png')
		return toFileStream(response, uri)
	}
}
