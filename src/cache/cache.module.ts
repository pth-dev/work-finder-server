import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis'; // ✅ Add Redis module
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { HttpCacheInterceptor } from './cache.interceptor';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = {
          type: 'single' as const,
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6379')),
          db: parseInt(configService.get('REDIS_DB', '0')),
          connectTimeout: 5000,
          lazyConnect: true,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        };

        // Only add username/password if they exist (for local Redis, they're usually empty)
        const username = configService.get('REDIS_USERNAME');
        const password = configService.get('REDIS_PASSWORD');

        if (username) redisConfig['username'] = username;
        if (password) redisConfig['password'] = password;

        return redisConfig;
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', 6379);
        const db = configService.get('REDIS_DB', 0);
        const username = configService.get('REDIS_USERNAME');
        const password = configService.get('REDIS_PASSWORD');

        // Build Redis URL - for local Redis, username/password are usually empty
        let redisUrl = `redis://${host}:${port}/${db}`;
        if (username && password) {
          redisUrl = `redis://${username}:${password}@${host}:${port}/${db}`;
        }

        return {
          store: redisStore,
          url: redisUrl,
          ttl: configService.get('CACHE_TTL', 300),
          max: configService.get('CACHE_MAX_ITEMS', 1000),
          socket: {
            connectTimeout: 5000,
            lazyConnect: true,
          },
          retry_strategy: (options: any) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              // End reconnecting on a specific error and flush all commands with error
              return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              // End reconnecting after a specific timeout and flush all commands with error
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
              // End reconnecting with built in error
              return undefined;
            }
            // Reconnect after
            return Math.min(options.attempt * 100, 3000);
          },
        };
      },
      inject: [ConfigService],
      isGlobal: true, // Make cache available globally
    }),
  ],
  providers: [CacheService, HttpCacheInterceptor], // ✅ Add providers
  exports: [CacheModule, CacheService, HttpCacheInterceptor], // ✅ Export services
})
export class RedisCacheModule {}
