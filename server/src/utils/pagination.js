export const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, offset };
};

export const getPagingData = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    items: data,
    pagination: {
      totalItems: Number(totalItems),
      totalPages,
      currentPage: page,
      limit
    }
  };
};
