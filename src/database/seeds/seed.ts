import { AppDataSource } from '../data-source';
import { seedCompanies } from './companies-seed';
import { seedJobs } from './jobs-seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    await seedCompanies(AppDataSource);
    await seedJobs(AppDataSource);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the seeding script
runSeeds();
