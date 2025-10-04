import { StandardApiResponse, PaginationInfo } from '../controllers/base-crud.controller';

export abstract class ResponseTransformer<TEntity, TResponseDto> {
  abstract transform(entity: TEntity): TResponseDto;

  toResponse(entity: TEntity): StandardApiResponse<TResponseDto> {
    return {
      success: true,
      data: this.transform(entity),
      message: 'Operation completed successfully',
      timestamp: new Date(),
      path: this.getPath()
    };
  }

  toPaginatedResponse(
    entities: TEntity[],
    pagination: PaginationInfo
  ): StandardApiResponse<TResponseDto[]> {
    return {
      success: true,
      data: entities.map(entity => this.transform(entity)),
      message: 'Data retrieved successfully',
      timestamp: new Date(),
      path: this.getPath(),
      pagination
    };
  }

  protected abstract getPath(): string;
}