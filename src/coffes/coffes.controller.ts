import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto'
import { Permissions } from 'src/iam/authorization/decorators/permissions.decorator'
import { Policies } from 'src/iam/authorization/decorators/policies.decorator'
import { Roles } from 'src/iam/authorization/decorators/roles.decorator'
import { Permission } from 'src/iam/authorization/permission.type'
import { FrameworkContributorPolicy } from 'src/iam/authorization/policies/framework-contributor.storage'
import { ActiveUser } from 'src/iam/decorators/active-user.decorator'
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface'
import { Role } from 'src/users/enum/role.enum'
import { CoffesService } from './coffes.service'
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto'

@Controller('coffees')
export class CoffesController {
	constructor(private readonly coffesService: CoffesService) {}

	@Get()
	findAll(@ActiveUser() user: ActiveUserData, @Query() paginationQuery: PaginationQueryDto) {
		return this.coffesService.findAll(paginationQuery)
	}

	@Get(':id')
	findOne(@Param('id') id: number) {
		return this.coffesService.findOne(id)
	}

	// @Roles(Role.Admin)
	// @Permissions(Permission.CreateCoffee)
	@Policies(new FrameworkContributorPolicy() /*, can make multiple policy */)
	@Post()
	// @HttpCode(HttpStatus.GONE)
	create(@Body() createCoffeeDto: CreateCoffeeDto) {
		return this.coffesService.create(createCoffeeDto)
	}

	@Roles(Role.Admin)
	@Patch(':id')
	update(@Param('id') id: number, @Body() updateCoffeDto: UpdateCoffeeDto) {
		return this.coffesService.update(id, updateCoffeDto)
	}

	@Roles(Role.Admin)
	@Delete(':id')
	remove(@Param('id') id: number) {
		return this.coffesService.remove(id)
	}
}
