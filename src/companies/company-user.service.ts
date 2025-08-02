import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  CompanyUser,
  CompanyUserRole,
  CompanyUserStatus,
} from './entities/company-user.entity';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JoinCompanyRequestDto } from './dto/join-company-request.dto';
import { ApproveJoinRequestDto } from './dto/approve-join-request.dto';
import { CompanySearchDto } from './dto/company-search.dto';
import { CompanyUserResponseDto } from './dto/response/company-user-response.dto';
import { PendingRequestDto } from './dto/response/pending-request.dto';
import { CompanyMemberDto } from './dto/response/company-member.dto';
import { CompanySearchResultDto } from './dto/response/company-search-result.dto';

@Injectable()
export class CompanyUserService {
  constructor(
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCompanyWithOwnership(
    userId: number,
    createCompanyDto: CreateCompanyDto,
  ): Promise<{ company_id: number; message: string }> {
    // Check if user already belongs to a company
    const existingMembership = await this.companyUserRepository.findOne({
      where: { user_id: userId, status: CompanyUserStatus.APPROVED },
    });

    if (existingMembership) {
      throw new ConflictException('User already belongs to a company');
    }

    // Create company
    const company = this.companyRepository.create(createCompanyDto);
    const savedCompany = await this.companyRepository.save(company);

    // Create company membership with owner role
    const companyUser = this.companyUserRepository.create({
      user_id: userId,
      company_id: savedCompany.company_id,
      role: CompanyUserRole.OWNER,
      status: CompanyUserStatus.APPROVED,
      approved_at: new Date(),
      approved_by: userId, // Self-approved as owner
    });

    await this.companyUserRepository.save(companyUser);

    return {
      company_id: savedCompany.company_id,
      message: 'Company created successfully',
    };
  }

  async requestJoinCompany(
    userId: number,
    joinRequestDto: JoinCompanyRequestDto,
  ): Promise<{ message: string }> {
    // Check if user already belongs to a company
    const existingMembership = await this.companyUserRepository.findOne({
      where: { user_id: userId, status: CompanyUserStatus.APPROVED },
    });

    if (existingMembership) {
      throw new ConflictException('User already belongs to a company');
    }

    // Check if company exists
    const company = await this.companyRepository.findOne({
      where: { company_id: joinRequestDto.company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if there's already a pending request
    const existingRequest = await this.companyUserRepository.findOne({
      where: {
        user_id: userId,
        company_id: joinRequestDto.company_id,
        status: CompanyUserStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('Join request already exists');
    }

    // Create join request
    const companyUser = this.companyUserRepository.create({
      user_id: userId,
      company_id: joinRequestDto.company_id,
      role: CompanyUserRole.MEMBER,
      status: CompanyUserStatus.PENDING,
    });

    await this.companyUserRepository.save(companyUser);

    return { message: 'Join request sent successfully' };
  }

  async getUserCompany(userId: number): Promise<CompanyUserResponseDto | null> {
    const membership = await this.companyUserRepository.findOne({
      where: { user_id: userId, status: CompanyUserStatus.APPROVED },
      relations: ['company'],
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.id,
      user_id: membership.user_id,
      company_id: membership.company_id,
      role: membership.role,
      status: membership.status,
      requested_at: membership.requested_at,
      approved_at: membership.approved_at,
      approved_by: membership.approved_by,
      company: {
        company_id: membership.company.company_id,
        company_name: membership.company.company_name,
        industry: membership.company.industry,
        company_image: membership.company.company_image,
        is_verified: membership.company.is_verified,
      },
    };
  }

  async getPendingRequests(
    companyId: number,
    requestingUserId: number,
  ): Promise<PendingRequestDto[]> {
    // Check if user has permission (owner or admin)
    await this.checkCompanyPermission(requestingUserId, companyId);

    const pendingRequests = await this.companyUserRepository.find({
      where: {
        company_id: companyId,
        status: CompanyUserStatus.PENDING,
      },
      relations: ['user'],
    });

    return pendingRequests.map((request) => ({
      id: request.id,
      user_id: request.user_id,
      requested_at: request.requested_at,
      user: {
        user_id: request.user.user_id,
        email: request.user.email,
        full_name: request.user.full_name,
        avatar: request.user.avatar,
      },
    }));
  }

  async approveJoinRequest(
    membershipId: number,
    requestingUserId: number,
    approveDto: ApproveJoinRequestDto,
  ): Promise<{ message: string }> {
    const membership = await this.companyUserRepository.findOne({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Join request not found');
    }

    // Check if user has permission
    await this.checkCompanyPermission(requestingUserId, membership.company_id);

    if (membership.status !== CompanyUserStatus.PENDING) {
      throw new BadRequestException('Request has already been processed');
    }

    // Update membership status
    membership.status =
      approveDto.status === 'approved'
        ? CompanyUserStatus.APPROVED
        : CompanyUserStatus.REJECTED;
    membership.approved_at = new Date();
    membership.approved_by = requestingUserId;

    await this.companyUserRepository.save(membership);

    const action = approveDto.status === 'approved' ? 'approved' : 'rejected';
    return { message: `Join request ${action} successfully` };
  }

  async getCompanyMembers(
    companyId: number,
    requestingUserId: number,
  ): Promise<CompanyMemberDto[]> {
    // Check if user has permission
    await this.checkCompanyPermission(requestingUserId, companyId);

    const members = await this.companyUserRepository.find({
      where: {
        company_id: companyId,
        status: CompanyUserStatus.APPROVED,
      },
      relations: ['user'],
    });

    return members.map((member) => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      status: member.status,
      requested_at: member.requested_at,
      approved_at: member.approved_at,
      user: {
        user_id: member.user.user_id,
        email: member.user.email,
        full_name: member.user.full_name,
        avatar: member.user.avatar,
      },
    }));
  }

  async removeMember(
    membershipId: number,
    requestingUserId: number,
  ): Promise<{ message: string }> {
    const membership = await this.companyUserRepository.findOne({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Check if user has permission
    await this.checkCompanyPermission(requestingUserId, membership.company_id);

    // Cannot remove owner
    if (membership.role === CompanyUserRole.OWNER) {
      throw new BadRequestException('Cannot remove company owner');
    }

    await this.companyUserRepository.remove(membership);

    return { message: 'Member removed successfully' };
  }

  async searchCompanies(
    searchDto: CompanySearchDto,
  ): Promise<CompanySearchResultDto[]> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.members', 'members', 'members.status = :status', {
        status: CompanyUserStatus.APPROVED,
      })
      .addSelect('COUNT(members.id)', 'member_count')
      .groupBy('company.company_id');

    if (searchDto.q) {
      queryBuilder.where('company.company_name ILIKE :name', {
        name: `%${searchDto.q}%`,
      });
    }

    if (searchDto.industry) {
      queryBuilder.andWhere('company.industry = :industry', {
        industry: searchDto.industry,
      });
    }

    queryBuilder
      .orderBy('company.is_verified', 'DESC')
      .addOrderBy('member_count', 'DESC')
      .limit(searchDto.limit || 10);

    const results = await queryBuilder.getRawAndEntities();

    return results.entities.map((company, index) => ({
      company_id: company.company_id,
      company_name: company.company_name,
      description: company.description,
      industry: company.industry,
      company_image: company.company_image,
      location: company.location,
      company_size: company.company_size,
      is_verified: company.is_verified,
      member_count: parseInt(results.raw[index].member_count) || 0,
    }));
  }

  private async checkCompanyPermission(
    userId: number,
    companyId: number,
  ): Promise<void> {
    const membership = await this.companyUserRepository.findOne({
      where: {
        user_id: userId,
        company_id: companyId,
        status: CompanyUserStatus.APPROVED,
      },
    });

    if (
      !membership ||
      (membership.role !== CompanyUserRole.OWNER &&
        membership.role !== CompanyUserRole.ADMIN)
    ) {
      throw new UnauthorizedException('Insufficient permissions');
    }
  }
}
