import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyUserService } from './company-user.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JoinCompanyRequestDto } from './dto/join-company-request.dto';
import { ApproveJoinRequestDto } from './dto/approve-join-request.dto';
import { CompanySearchDto } from './dto/company-search.dto';
import { Company } from './entities/company.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyUserService: CompanyUserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new company and become owner' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Recruiter/Admin access required',
  })
  @ApiBearerAuth()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return await this.companyUserService.createCompanyWithOwnership(
      user.user_id,
      createCompanyDto,
    );
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in company name and description',
  })
  @ApiQuery({
    name: 'industry',
    required: false,
    description: 'Filter by industry',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @CurrentUser() user?: any,
  ) {
    const filters = { page, limit, search, industry };

    // Use user-specific method if user is authenticated
    if (user?.user_id) {
      return await this.companiesService.findAllWithUserData(
        filters,
        user.user_id,
      );
    }

    return await this.companiesService.findAll(filters);
  }

  @Get(':identifier')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific company by ID or slug' })
  @ApiParam({
    name: 'identifier',
    description: 'Company ID (numeric) or slug (string)',
  })
  @ApiResponse({ status: 200, description: 'Company found', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(
    @Param('identifier') identifier: string,
    @CurrentUser() user?: any,
  ): Promise<Company> {
    // Use user-specific method if user is authenticated
    if (user?.user_id) {
      return await this.companiesService.findBySlugOrIdWithUserData(
        identifier,
        user.user_id,
      );
    }

    return await this.companiesService.findBySlugOrId(identifier);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Recruiter/Admin access required',
  })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return await this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Recruiter/Admin access required',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.companiesService.remove(id);
  }

  @Get(':id/jobs')
  @ApiOperation({ summary: 'Get all jobs posted by a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company jobs retrieved successfully',
  })
  async getCompanyJobs(@Param('id', ParseIntPipe) id: number) {
    return await this.companiesService.getCompanyJobs(id);
  }

  // ============ COMPANY USER MANAGEMENT ENDPOINTS ============

  @Get('search')
  @ApiOperation({ summary: 'Search companies for joining' })
  @ApiResponse({ status: 200, description: 'Companies found' })
  async searchCompanies(@Query() searchDto: CompanySearchDto) {
    return await this.companyUserService.searchCompanies(searchDto);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request to join a company' })
  @ApiResponse({ status: 201, description: 'Join request sent' })
  @ApiBearerAuth()
  async requestJoinCompany(
    @CurrentUser() user: any,
    @Body() joinRequestDto: JoinCompanyRequestDto,
  ) {
    return await this.companyUserService.requestJoinCompany(
      user.user_id,
      joinRequestDto,
    );
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user company membership' })
  @ApiResponse({ status: 200, description: 'User company info' })
  @ApiBearerAuth()
  async getUserCompany(@CurrentUser() user: any) {
    return await this.companyUserService.getUserCompany(user.user_id);
  }

  @Get(':id/pending-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get pending join requests (owner/admin only)' })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved' })
  @ApiBearerAuth()
  async getPendingRequests(
    @Param('id', ParseIntPipe) companyId: number,
    @CurrentUser() user: any,
  ) {
    return await this.companyUserService.getPendingRequests(
      companyId,
      user.user_id,
    );
  }

  @Patch('membership/:membershipId/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve or reject join request' })
  @ApiResponse({ status: 200, description: 'Request processed' })
  @ApiBearerAuth()
  async approveJoinRequest(
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @CurrentUser() user: any,
    @Body() approveDto: ApproveJoinRequestDto,
  ) {
    return await this.companyUserService.approveJoinRequest(
      membershipId,
      user.user_id,
      approveDto,
    );
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get company members (owner/admin only)' })
  @ApiResponse({ status: 200, description: 'Company members retrieved' })
  @ApiBearerAuth()
  async getCompanyMembers(
    @Param('id', ParseIntPipe) companyId: number,
    @CurrentUser() user: any,
  ) {
    return await this.companyUserService.getCompanyMembers(
      companyId,
      user.user_id,
    );
  }

  @Delete('membership/:membershipId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove company member (owner/admin only)' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiBearerAuth()
  async removeMember(
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @CurrentUser() user: any,
  ) {
    return await this.companyUserService.removeMember(
      membershipId,
      user.user_id,
    );
  }

  // ============ COMPANY FOLLOW/UNFOLLOW ENDPOINTS ============

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company followed successfully',
    schema: {
      example: {
        message: 'Company followed successfully',
        is_followed: true,
        follower_count: 42,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Company already followed' })
  @ApiBearerAuth()
  async followCompany(
    @Param('id', ParseIntPipe) companyId: number,
    @CurrentUser() user: any,
  ) {
    return await this.companiesService.followCompany(user.user_id, companyId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company unfollowed successfully',
    schema: {
      example: {
        message: 'Company unfollowed successfully',
        is_followed: false,
        follower_count: 41,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found or not followed',
  })
  @ApiBearerAuth()
  async unfollowCompany(
    @Param('id', ParseIntPipe) companyId: number,
    @CurrentUser() user: any,
  ) {
    return await this.companiesService.unfollowCompany(user.user_id, companyId);
  }
}
