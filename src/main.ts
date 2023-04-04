import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, //	Щоб не було помилки якщо буде додано інше поле, наприклад при створенні coffee в POST
			transform: true, //можуть автоматично трансформувати payload в об'єкти', типизовані у відповідності з їх класами DTO
			forbidNonWhitelisted: true, //якщо true, замість видалення свойтв, не включених до whitelist, валідатор видасть виключення.
			transformOptions: {
				enableImplicitConversion: true //наразі не треба використовувати @Type декоратор
			},
		})
	)
	app.enableCors()
	await app.listen(5000)
}
bootstrap()
