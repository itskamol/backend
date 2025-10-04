import { QueryDto, PaginationResponseDto } from '@app/shared/utils';
import {
  UserContext,
  PaginationInfo,
  DataScope,
} from '@app/shared/interfaces';
import { BaseRepository } from '@app/shared/repositories';

// Minimal interface for LoggerService (to be replaced with a shared logger module)
export interface LoggerService {
  log(message: any, context?: string | object): void;
  error(message: any, trace?: string, context?: string | object): void;
  warn(message: any, context?: string | object): void;
  debug?(message: any, context?: string | object): void;
}

// Minimal interface for ValidationService (to be replaced with a shared validation module)
export interface ValidationService {
  validate<T extends object>(dto: T, groups?: string[]): Promise<void>;
}

export abstract class BaseCrudService<
  TEntity,
  TCreateDto,
  TUpdateDto,
  TRepository extends BaseRepository<
    TEntity,
    any,
    any
  > = BaseRepository<TEntity, any, any>
> {
  constructor(
    protected readonly repository: TRepository,
    protected readonly logger: LoggerService,
    protected readonly validator: ValidationService
  ) {}

  async create(createDto: TCreateDto, user: UserContext): Promise<TEntity> {
    await this.validator.validate(createDto);
    await this.validateBusinessRules(createDto, user, 'create');

    const entity = await this.repository.create(
      this.transformCreateDto(createDto),
      undefined,
      this.getDataScope(user)
    );

    await this.afterCreate(entity, user);
    this.logger.log(`Entity created: ${JSON.stringify(entity)}`);
    return entity;
  }

  async findAllWithPagination(
    query: QueryDto,
    user: UserContext
  ): Promise<{ data: TEntity[]; pagination: PaginationInfo }> {
    const filters = this.buildFilters(query, user);
    const result: PaginationResponseDto<TEntity> =
      await this.repository.findManyWithPagination(
        filters,
        { [query.sort || 'createdAt']: query.order || 'desc' },
        this.getIncludeOptions(),
        {
          page: query.page,
          limit: query.limit,
        },
        this.getDataScope(user)
      );

    return {
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async findOne(id: string, user: UserContext): Promise<TEntity | null> {
    return this.repository.findById(id, undefined, this.getDataScope(user));
  }

  async update(
    id: string,
    updateDto: TUpdateDto,
    user: UserContext
  ): Promise<TEntity> {
    await this.validator.validate(updateDto);
    const existingEntity = await this.repository.findById(
      id,
      undefined,
      this.getDataScope(user)
    );
    await this.validateBusinessRules(updateDto, user, 'update', existingEntity);

    const entity = await this.repository.update(
      id,
      this.transformUpdateDto(updateDto),
      undefined,
      this.getDataScope(user)
    );

    await this.afterUpdate(entity, existingEntity, user);
    this.logger.log(`Entity updated: ${JSON.stringify(entity)}`);
    return entity;
  }

  async remove(id: string, user: UserContext): Promise<void> {
    const existingEntity = await this.repository.findById(
      id,
      undefined,
      this.getDataScope(user)
    );
    await this.validateBusinessRules(null, user, 'delete', existingEntity);
    await this.repository.delete(id, this.getDataScope(user));
    await this.afterDelete(existingEntity, user);
    this.logger.log(`Entity with id ${id} deleted`);
  }

  // Abstract methods for customization
  protected abstract transformCreateDto(dto: TCreateDto): any;
  protected abstract transformUpdateDto(dto: TUpdateDto): any;
  protected abstract buildFilters(query: QueryDto, user: UserContext): any;
  protected abstract getDataScope(user: UserContext): DataScope;
  protected abstract getIncludeOptions(): any;

  // Hook methods
  protected async validateBusinessRules(
    dto: TCreateDto | TUpdateDto | null,
    user: UserContext,
    operation: 'create' | 'update' | 'delete',
    existingEntity?: TEntity
  ): Promise<void> {}

  protected async afterCreate(entity: TEntity, user: UserContext): Promise<void> {}
  protected async afterUpdate(entity: TEntity, previousEntity: TEntity, user: UserContext): Promise<void> {}
  protected async afterDelete(entity: TEntity, user: UserContext): Promise<void> {}
}