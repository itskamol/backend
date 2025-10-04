import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
    @ApiProperty({
        description: 'The data for the current page.',
        isArray: true,
    })
    data: T[];

    @ApiProperty({
        description: 'The total number of items.',
        example: 100,
    })
    total?: number;

    @ApiProperty({
        description: 'The current page number.',
        example: 1,
    })
    page?: number;

    @ApiProperty({
        description: 'The number of items per page.',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'The total number of pages.',
        example: 10,
    })
    totalPages?: number;

    constructor(data: T[], total: number, page: number, limit: number) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = Math.ceil(total / limit);
    }
}