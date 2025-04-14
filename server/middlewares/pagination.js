// pagination.js
const pagination = (req, res, next) => {
    let { page, limit } = req.query;
  
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
  
    req.pagination = {
      limit,
      offset: (page - 1) * limit,
      page,
    };
  
    next();
  };

module.exports = pagination;
