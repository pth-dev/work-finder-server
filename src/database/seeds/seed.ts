import { AppDataSource } from '../data-source';
import { seedCompanies } from './companies-seed';
import { seedJobs } from './jobs-seed';

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run company seeds first (jobs depend on companies)
    console.log('📊 Seeding companies...');
    await seedCompanies(AppDataSource);
    
    // Run job seeds
    console.log('💼 Seeding jobs...');
    await seedJobs(AppDataSource);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📈 Summary:');
    console.log('  - Companies: 20');
    console.log('  - Jobs: 100+');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the seeding script
runSeeds();