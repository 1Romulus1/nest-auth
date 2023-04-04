import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { REQUEST_USER_KEY } from 'src/iam/constants/iam.constants'
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface'
import { Role } from 'src/users/enum/role.enum'
import { ROLES_KEY } from '../../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const contextRole = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		])
		if (!contextRole) {
			return true
		}

		const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY]
		return contextRole.some(role => user.role === role)
	}
}
