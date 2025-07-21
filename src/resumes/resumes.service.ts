import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async create(createResumeDto: CreateResumeDto): Promise<Resume> {
    const resume = this.resumeRepository.create(createResumeDto);
    return await this.resumeRepository.save(resume);
  }

  async findAll(): Promise<Resume[]> {
    return await this.resumeRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { resume_id: id },
      relations: ['user', 'applications'],
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    return resume;
  }

  async findByUser(userId: number): Promise<Resume[]> {
    return await this.resumeRepository.find({
      where: { user_id: userId },
      order: { upload_time: 'DESC' },
    });
  }

  async update(id: number, updateResumeDto: UpdateResumeDto): Promise<Resume> {
    const resume = await this.findOne(id);
    Object.assign(resume, updateResumeDto);
    return await this.resumeRepository.save(resume);
  }

  async remove(id: number): Promise<void> {
    const resume = await this.findOne(id);
    await this.resumeRepository.remove(resume);
  }
}
