import { Permission, PermissionType } from 'src/iam/authorization/permission.type'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Role } from '../enum/role.enum'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	email: string

	@Column({ nullable: true })
	password: string

	@Column({ enum: Role, default: Role.Regular })
	role: Role

	@Column({ nullable: true })
	googleId: string

	@Column({default: false})
	isTfaEnabled: boolean

	@Column({nullable: true})
	tfaSecret: string

	//NOTE having the "permissions" column in combination with the "role"
	//does not make sense, I use both just for practice
	//other way is using permission for role
	@Column({ enum: Permission, default: [], type: 'json' })
	permissions: PermissionType[]
}
