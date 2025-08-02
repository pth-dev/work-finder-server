import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '5432'),
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'password',
  database: configService.get('DB_DATABASE') || 'work_finder',
  entities: [
    __dirname + '/../users/entities/user.entity{.ts,.js}',
    __dirname + '/../companies/entities/company.entity{.ts,.js}',
    __dirname + '/../companies/entities/company-user.entity{.ts,.js}',
    __dirname + '/../jobs/entities/job.entity{.ts,.js}',
    __dirname + '/../applications/entities/application.entity{.ts,.js}',
    __dirname + '/../applications/entities/interview.entity{.ts,.js}',
    __dirname + '/../jobs/entities/saved-job.entity{.ts,.js}',
    __dirname + '/../companies/entities/followed-company.entity{.ts,.js}',
    __dirname + '/../notifications/entities/notification.entity{.ts,.js}',
    __dirname + '/../resumes/entities/resume.entity{.ts,.js}',
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // ✅ FIXED: Environment-specific synchronize setting
  synchronize: configService.get('NODE_ENV') === 'development',
  migrationsRun: configService.get('NODE_ENV') === 'production',
  logging: configService.get('NODE_ENV') === 'development',
  // ✅ ADDED: Connection pooling configuration
  extra: {
    connectionLimit: parseInt(configService.get('DB_CONNECTION_LIMIT') || '20'),
    acquireTimeout: parseInt(
      configService.get('DB_ACQUIRE_TIMEOUT') || '60000',
    ),
    timeout: parseInt(configService.get('DB_TIMEOUT') || '60000'),
    reconnect: true,
    // Connection pool settings
    max: parseInt(configService.get('DB_POOL_MAX') || '20'),
    min: parseInt(configService.get('DB_POOL_MIN') || '5'),
    idle: parseInt(configService.get('DB_POOL_IDLE') || '10000'),
  },
  ssl:
    configService.get('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
