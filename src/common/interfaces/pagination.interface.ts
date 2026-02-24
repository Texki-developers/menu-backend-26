export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export interface PaginatedMeta {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    totalWithoutFilter?: number;
    [key: string]: any;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
}
