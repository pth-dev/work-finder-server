import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CategoriesService, CategoryWithJobCount } from './categories.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories with job counts
   * GET /api/v1/categories
   */
  @Public()
  @Get()
  async findAll(): Promise<CategoryWithJobCount[]> {
    return await this.categoriesService.findAll();
  }

  /**
   * Get job count for a specific category
   * GET /api/v1/categories/:id/jobs-count
   */
  @Public()
  @Get(':id/jobs-count')
  async getJobCount(
    @Param('id') id: string,
  ): Promise<{ categoryId: string; jobCount: number }> {
    const category = this.categoriesService.findOne(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const jobCount = await this.categoriesService.getJobCountForCategory(id);

    return {
      categoryId: id,
      jobCount,
    };
  }
}
