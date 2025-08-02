import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5432'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // ✅ FIXED: Environment-specific synchronize setting
        synchronize: configService.get('NODE_ENV') === 'development',
        migrationsRun: configService.get('NODE_ENV') === 'production',
        logging: configService.get('NODE_ENV') === 'development',
        // ✅ ADDED: Connection pooling and performance settings
        extra: {
          connectionLimit: parseInt(
            configService.get('DB_CONNECTION_LIMIT') || '20',
          ),
          acquireTimeout: parseInt(
            configService.get('DB_ACQUIRE_TIMEOUT') || '60000',
          ),
          timeout: parseInt(configService.get('DB_TIMEOUT') || '60000'),
          reconnect: true,
          // Connection pool settings
          max: parseInt(configService.get('DB_POOL_MAX') || '20'),
          min: parseInt(configService.get('DB_POOL_MIN') || '5'),
          idle: parseInt(configService.get('DB_POOL_IDLE') || '10000'),
          // Query performance settings
          statement_timeout: parseInt(
            configService.get('DB_STATEMENT_TIMEOUT') || '30000',
          ),
          query_timeout: parseInt(
            configService.get('DB_QUERY_TIMEOUT') || '30000',
          ),
        },
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
