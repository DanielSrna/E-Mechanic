export function paginate(query, options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    findOptions: {
      skip,
      limit,
    },
  };
}

export function paginatedResponse(data, total, { page, limit }) {
  return {
    count: data.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}
