import { Role } from 'src/users/enum/role.enum'
import { PermissionType } from '../authorization/permission.type'

export interface ActiveUserData {
	sub: number
	email: string
	role: Role
	permissions: PermissionType[]
}
