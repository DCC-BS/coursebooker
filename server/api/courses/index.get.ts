import { getDatabase } from "../../services/database";

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    const query = getQuery(event);

    // Build filters object
    const filters = {
        fromDate: query.from as string | undefined,
        toDate: query.to as string | undefined,
        organizer: query.organizer as string | undefined,
        search: query.search as string | undefined,
        sortOrder: (query.sort as "asc" | "desc") || "asc",
        page: Number.parseInt(query.page as string) || 1,
        limit: Number.parseInt(query.limit as string) || 10,
    };

    // Get total count for pagination (without limit)
    const totalFilters = {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        organizer: filters.organizer,
        search: filters.search,
        sortOrder: filters.sortOrder,
    };

    const [courses, allCourses] = await Promise.all([
        db.getAllCourses(filters),
        db.getAllCourses(totalFilters),
    ]);

    const total = allCourses.length;
    const totalPages = Math.ceil(total / filters.limit);

    return {
        courses,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
    };
});
