import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module'
import { CoffesModule } from './coffes/coffes.module'
import { IamModule } from './iam/iam.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: 'postgres',
				host: process.env.DATABASE_HOST,
				port: +process.env.DATABASE_PORT,
				username: process.env.DATABASE_USERNAME,
				password: process.env.DATABASE_PASSWORD,
				database: process.env.DATABASE_NAME,
				autoLoadEntities: true,
				synchronize: true, //shouldn't be used in production - otherwise you can lose production data.
				retryAttempts: 2,
				retryDelay: 3000,
			}),
		}),
		ConfigModule.forRoot(),
		CoffesModule,
		CoffeeRatingModule,
		IamModule,
		UsersModule,
	],

	controllers: [AppController],
	providers: [AppService /*{provide: APP_PIPE, useClass: ValidationPipe}*/],
})
export class AppModule {}
