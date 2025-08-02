import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingCategoriesTables1722380000000 implements MigrationInterface {
  name = 'AddMissingCategoriesTables1722380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Categories table (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Create Job Categories junction table (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job_categories (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
        UNIQUE(job_id, category_id)
      )
    `);

    // 3. Remove followed_companies table if exists (not in final design)
    await queryRunner.query(`DROP TABLE IF EXISTS followed_companies CASCADE`);

    // 4. Create essential indexes for categories
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
      CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(category_name);
      CREATE INDEX IF NOT EXISTS idx_job_categories_job ON job_categories(job_id);
      CREATE INDEX IF NOT EXISTS idx_job_categories_category ON job_categories(category_id);
    `);

    // 5. Insert sample categories data
    await queryRunner.query(`
      INSERT INTO categories (category_name, description) VALUES
      ('Công nghệ thông tin', 'Các vị trí liên quan đến IT, phần mềm, phát triển web'),
      ('Marketing/Sales', 'Các vị trí marketing, bán hàng, kinh doanh'),
      ('Kế toán/Tài chính', 'Các vị trí kế toán, tài chính, ngân hàng'),
      ('Nhân sự', 'Các vị trí nhân sự, tuyển dụng, đào tạo'),
      ('Thiết kế đồ họa', 'Các vị trí thiết kế, sáng tạo, nghệ thuật'),
      ('Kỹ thuật/Xây dựng', 'Các vị trí kỹ thuật, xây dựng, cơ khí'),
      ('Giáo dục/Đào tạo', 'Các vị trí giảng dạy, đào tạo, giáo dục'),
      ('Y tế/Chăm sóc sức khỏe', 'Các vị trí y tế, chăm sóc sức khỏe'),
      ('Dịch vụ khách hàng', 'Các vị trí chăm sóc khách hàng, hỗ trợ'),
      ('Logistics/Vận chuyển', 'Các vị trí logistics, vận chuyển, kho bãi')
      ON CONFLICT (category_name) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_categories_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_categories_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_categories_job`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_categories_category`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS job_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
  }
}