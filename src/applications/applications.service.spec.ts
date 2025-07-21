import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { JobPost } from '../jobs/entities/job.entity';
import { Resume } from '../resumes/entities/resume.entity';
import { User } from '../users/entities/user.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { JobStatus } from '../common/enums/job-status.enum';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('ApplicationsService - Business Logic Validation', () => {
  let service: ApplicationsService;
  let applicationRepository: Repository<Application>;
  let jobRepository: Repository<JobPost>;
  let resumeRepository: Repository<Resume>;
  let userRepository: Repository<User>;

  const mockApplicationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJobRepository = {
    findOne: jest.fn(),
  };

  const mockResumeRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(JobPost),
          useValue: mockJobRepository,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationRepository = module.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
    jobRepository = module.get<Repository<JobPost>>(
      getRepositoryToken(JobPost),
    );
    resumeRepository = module.get<Repository<Resume>>(
      getRepositoryToken(Resume),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createApplicationDto = {
      job_id: 1,
      resume_id: 1,
      user_id: 1,
    };

    it('should throw NotFoundException when job does not exist', async () => {
      mockJobRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createApplicationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { job_id: 1 },
        relations: ['company'],
      });
    });

    it('should throw BadRequestException when job is not active', async () => {
      const inactiveJob = {
        job_id: 1,
        status: JobStatus.CLOSED,
        application_deadline: null,
      };
      mockJobRepository.findOne.mockResolvedValue(inactiveJob);

      await expect(service.create(createApplicationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    // Note: Deadline validation temporarily disabled until application_deadline field is added
    // it('should throw BadRequestException when application deadline has passed', async () => {
    //   const expiredJob = {
    //     job_id: 1,
    //     status: JobStatus.ACTIVE,
    //     application_deadline: new Date('2023-01-01'), // Past date
    //   };
    //   mockJobRepository.findOne.mockResolvedValue(expiredJob);

    //   await expect(service.create(createApplicationDto)).rejects.toThrow(
    //     BadRequestException,
    //   );
    // });

    it('should throw ConflictException when user already applied', async () => {
      const activeJob = {
        job_id: 1,
        status: JobStatus.ACTIVE,
      };
      const user = { user_id: 1 };
      const resume = { resume_id: 1, user_id: 1 };
      const existingApplication = { application_id: 1 };

      mockJobRepository.findOne.mockResolvedValue(activeJob);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockResumeRepository.findOne.mockResolvedValue(resume);
      mockApplicationRepository.findOne.mockResolvedValue(existingApplication);

      await expect(service.create(createApplicationDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create application successfully with valid data', async () => {
      const activeJob = {
        job_id: 1,
        status: JobStatus.ACTIVE,
      };
      const user = { user_id: 1 };
      const resume = { resume_id: 1, user_id: 1 };
      const savedApplication = { application_id: 1 };
      const finalApplication = {
        application_id: 1,
        job_post: activeJob,
        user,
        resume,
      };

      mockJobRepository.findOne.mockResolvedValue(activeJob);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockResumeRepository.findOne.mockResolvedValue(resume);
      mockApplicationRepository.findOne
        .mockResolvedValueOnce(null) // No existing application
        .mockResolvedValueOnce(finalApplication); // Final result
      mockApplicationRepository.create.mockReturnValue(savedApplication);
      mockApplicationRepository.save.mockResolvedValue(savedApplication);

      const result = await service.create(createApplicationDto);

      expect(result).toEqual(finalApplication);
      expect(mockApplicationRepository.create).toHaveBeenCalledWith({
        ...createApplicationDto,
        status: ApplicationStatus.PENDING,
        applied_at: expect.any(Date),
      });
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid status transitions', () => {
      expect(() =>
        service['validateStatusTransition'](
          ApplicationStatus.PENDING,
          ApplicationStatus.REVIEWING,
        ),
      ).not.toThrow();

      expect(() =>
        service['validateStatusTransition'](
          ApplicationStatus.REVIEWING,
          ApplicationStatus.INTERVIEW_SCHEDULED,
        ),
      ).not.toThrow();
    });

    it('should throw BadRequestException for invalid transitions', () => {
      expect(() =>
        service['validateStatusTransition'](
          ApplicationStatus.ACCEPTED,
          ApplicationStatus.PENDING,
        ),
      ).toThrow(BadRequestException);

      expect(() =>
        service['validateStatusTransition'](
          ApplicationStatus.REJECTED,
          ApplicationStatus.REVIEWING,
        ),
      ).toThrow(BadRequestException);
    });
  });
});
