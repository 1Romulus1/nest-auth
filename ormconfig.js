module.exports = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'username',
	password: 'password',
	database: 'Coffees',
	entities: ['dist/migrations/*.js'],
	cli: {
		migrationsDir: 'src/migrations'
	}
}