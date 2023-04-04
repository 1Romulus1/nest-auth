import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { Redis } from 'ioredis'

export class InvalidateRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
	private redisClient: Redis

	onApplicationBootstrap() {
		//Ideally we should move this tj the dedicated 'RedisModule'
		//insted of initiating the connection here
		this.redisClient = new Redis({
			host: 'localhost', // we should use env variables
			port: 6379,
		})
	}
	async onApplicationShutdown(signal?: string) {
		await this.redisClient.quit()
	}

	async insert(userId: number, tokenId: string): Promise<void> {
		await this.redisClient.set(this.getKey(userId), tokenId)
	}

	async validate(userId: number, tokenId: string): Promise<boolean> {
		const storedId = await this.redisClient.get(this.getKey(userId))
		if(storedId !== tokenId) {
			throw new InvalidateRefreshTokenError()
		}
		return storedId === tokenId
	}

	async invalidate(userId: number): Promise<void> {
		await this.redisClient.del(this.getKey(userId))
	}

	private getKey(userId: number): string {
		return `user-${userId}`
	}
}
