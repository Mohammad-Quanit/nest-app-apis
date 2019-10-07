import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaDTO } from '../../DTO/idea.dto';
import { IdeaEntity } from '../../entity/idea.entity';
import { UserEntity } from '../../entity/user.entity';
import { IdeaResponseObject } from '../../DTO/IdeaResponse.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  /* A custom response method for idea services */
  private toResponseObject(idea: IdeaEntity): IdeaResponseObject {
    return { ...idea, author: idea.author.toResponseObject(false) };
  }

  /* Showing all ideas */
  async showAll() {
    const ideas = await this.ideaRepository.find({ relations: ['author'] });
    return ideas.map(idea => this.toResponseObject(idea));
  }

  /* Creating/Saving an idea */
  async create(id: string, data: IdeaDTO): Promise<IdeaResponseObject> {
    const user = await this.userRepository.findOne({ where: { id } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  /* showing single idea */
  async showOne(id: string): Promise<IdeaResponseObject> {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
  }

  /* Updating an idea */
  async update(id: string, data: Partial<IdeaDTO>): Promise<IdeaResponseObject> {
    let idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({ where: { id } });
    return this.toResponseObject(idea);
  }

  /* Deleting an idea */
  async destroy(id: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.delete({ id });
    return idea;
  }
}
