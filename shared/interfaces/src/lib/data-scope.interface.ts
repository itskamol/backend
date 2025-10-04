import { Role } from '@app/shared/auth';

export interface DataScope {
    organizationId?: number;
    departments?: number[];
    departmentIds?: number[];
}

export interface UserContext extends DataScope {
    sub: string;
    username: string;
    role: Role;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface StandardApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: PaginationInfo;
    timestamp?: Date;
    path?: string;
}