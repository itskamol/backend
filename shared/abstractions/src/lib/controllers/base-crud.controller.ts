import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { User as GetUser } from '@app/shared/auth';
import { QueryDto } from '@app/shared/utils';
import { BaseCrudService } from '../services/base-crud.service';
import { ResponseTransformer } from '../transformers/response.transformer';
import {
  PaginationInfo,
  StandardApiResponse,
  UserContext,
} from '@app/shared/interfaces';

export abstract class BaseCrudController<
  TEntity,
  TCreateDto,
  TUpdateDto,
  TResponseDto
> {
  constructor(
    protected readonly service: BaseCrudService<TEntity, TCreateDto, TUpdateDto>,
    protected readonly responseTransformer: ResponseTransformer<TEntity, TResponseDto>
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  async create(
    @Body() createDto: TCreateDto,
    @GetUser() user: UserContext
  ): Promise<StandardApiResponse<TResponseDto>> {
    const entity = await this.service.create(createDto, user);
    return this.responseTransformer.toResponse(entity);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  async findAll(
    @Query() query: QueryDto,
    @GetUser() user: UserContext
  ): Promise<StandardApiResponse<TResponseDto[]>> {
    const { data, pagination } = await this.service.findAllWithPagination(query, user);
    return this.responseTransformer.toPaginatedResponse(data, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: UserContext
  ): Promise<StandardApiResponse<TResponseDto>> {
    const entity = await this.service.findOne(id, user);
    return this.responseTransformer.toResponse(entity);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entity' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: TUpdateDto,
    @GetUser() user: UserContext
  ): Promise<StandardApiResponse<TResponseDto>> {
    const entity = await this.service.update(id, updateDto, user);
    return this.responseTransformer.toResponse(entity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: UserContext
  ): Promise<StandardApiResponse<void>> {
    await this.service.remove(id, user);
    return { success: true, message: 'Entity deleted successfully' };
  }
}