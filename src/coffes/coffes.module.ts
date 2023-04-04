import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Event } from 'src/events/entities/event.entity/event.entity'
import { CoffesController } from './coffes.controller'
import { CoffesService } from './coffes.service'
import { Coffee } from './entities/coffee.entity/coffee.entity'
import { Flavor } from './entities/flavor.entity/flavor.entity'

@Module({
	controllers: [CoffesController],
	providers: [CoffesService],
	imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event]), ConfigModule],
	exports: [CoffesService],
})
export class CoffesModule {}
