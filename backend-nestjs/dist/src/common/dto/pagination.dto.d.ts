export declare class PaginationDto {
    page?: number;
    limit?: number;
    get skip(): number;
    get take(): number;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export declare function createPaginatedResponse<T>(items: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
