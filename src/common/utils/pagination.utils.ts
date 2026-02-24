import { Model } from 'mongoose';
import { PaginatedResponse, SortOrder } from '../interfaces/pagination.interface';

export interface PaginationOptions {
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: SortOrder;
    baseFilter?: Record<string, any>;
    searchFilter?: Record<string, any>;
    extraFacets?: Record<string, any[]>;
}

export async function paginate<T>(
    model: Model<T>,
    options: PaginationOptions
): Promise<PaginatedResponse<T>> {
    const {
        page = '1',
        limit = '10',
        sortBy = 'created_at',
        sortOrder = SortOrder.DESC,
        baseFilter = {},
        searchFilter = {},
        extraFacets = {}
    } = options;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const sortValue = sortOrder === SortOrder.DESC ? -1 : 1;

    // Build the projection for results and counts
    const projectStage: Record<string, any> = {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        totalWithoutFilter: { $ifNull: [{ $arrayElemAt: ['$totalWithoutFilter.count', 0] }, 0] }
    };

    // Add extra facets to projection if they exist
    Object.keys(extraFacets).forEach(key => {
        projectStage[key] = { $ifNull: [{ $arrayElemAt: [`$${key}.count`, 0] }, 0] };
    });

    const [result] = await model.aggregate([
        { $match: baseFilter },
        {
            $facet: {
                data: [
                    { $match: searchFilter },
                    { $sort: { [sortBy]: sortValue } },
                    { $skip: skip },
                    { $limit: limitNum }
                ],
                total: [
                    { $match: searchFilter },
                    { $count: 'count' }
                ],
                totalWithoutFilter: [
                    { $count: 'count' }
                ],
                ...extraFacets
            }
        },
        {
            $project: projectStage
        }
    ]);

    const total = result.total;

    // Build meta object
    const meta: any = {
        total,
        totalPages: Math.ceil(total / limitNum),
        totalWithoutFilter: result.totalWithoutFilter,
        page: pageNum,
        limit: limitNum,
    };

    // Add result of extra facets to meta
    Object.keys(extraFacets).forEach(key => {
        meta[key] = result[key];
    });

    return {
        data: result.data,
        meta
    };
}
