import { CoffeesPermission } from 'src/coffes/coffee.permission'

export const Permission = {
	...CoffeesPermission
}

export type PermissionType = CoffeesPermission // | other permission enum