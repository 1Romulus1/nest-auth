import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto'
import { Event } from 'src/events/entities/event.entity/event.entity'
import { DataSource, Repository } from 'typeorm'
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto'
import { Coffee } from './entities/coffee.entity/coffee.entity'
import { Flavor } from './entities/flavor.entity/flavor.entity'

@Injectable()
export class CoffesService {
	constructor(
		@InjectRepository(Coffee) private readonly coffeeRepository: Repository<Coffee>,
		@InjectRepository(Flavor) private readonly flavorRepository: Repository<Flavor>,
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService,
	) {}

	findAll(paginationQuery: PaginationQueryDto) {
		const { limit, offset } = paginationQuery
		return this.coffeeRepository.find({
			relations: ['flavors'],
			skip: offset,
			take: limit,
		})
	}

	async findOneBy(id: number) {
		const coffee = await this.coffeeRepository.findOneBy({ id: id })
		if (!coffee) {
			throw new NotFoundException(`Coffee #${id} not found!`)
		}
		return coffee
	}

	async findOne(id: number) {
		const coffee = await this.coffeeRepository.findOne({
			where: { id: id },
			relations: { flavors: true },
		})
		if (!coffee) {
			throw new NotFoundException(`Coffee #${id} not found!`)
			//or we can use
			// throw new HttpException(`Coffee #${id} not found!`, HttpStatus.NOT_FOUND)
		}
		return coffee
	}

	async create(createCoffeeDto: CreateCoffeeDto) {
		const flavors = await Promise.all(createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)))

		const coffee = this.coffeeRepository.create({ ...createCoffeeDto, flavors })
		return this.coffeeRepository.save(coffee)
	}

	async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
		const flavors =
			updateCoffeeDto.flavors &&
			(await Promise.all(updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))))

		const coffee = await this.coffeeRepository.preload({
			id: id,
			...updateCoffeeDto,
			flavors,
		})
		if (!coffee) {
			throw new NotFoundException(`Coffee #${id} not found`)
		}
		return this.coffeeRepository.save(coffee)
	}

	async remove(id: number) {
		const coffee = await this.findOneBy(id)
		return this.coffeeRepository.remove(coffee)
	}

	async recommendCoffee(coffee: Coffee) {
		const queryRunner = this.dataSource.createQueryRunner()

		await queryRunner.connect()
		await queryRunner.startTransaction()

		try {
			coffee.recomendation++
			const recomendEvent = new Event()
			recomendEvent.name = 'recommended_coffee'
			recomendEvent.type = 'coffee'
			recomendEvent.payload = { coffeeId: coffee.id }

			await queryRunner.manager.save(coffee)
			await queryRunner.manager.save(recomendEvent)

			await queryRunner.commitTransaction()
		} catch (error) {
			await queryRunner.rollbackTransaction()
		} finally {
			await queryRunner.release()
		}
	}

	private async preloadFlavorByName(name: string): Promise<Flavor> {
		const existingFlavor = await this.flavorRepository.findOneBy({ name: name })
		if (existingFlavor) {
			return existingFlavor
		}
		return this.flavorRepository.create({ name })
	}
}
