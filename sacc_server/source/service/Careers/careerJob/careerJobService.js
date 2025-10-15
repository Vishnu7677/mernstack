const repository = require('./careerJobRepository');


function Service() {}
Service.prototype.getAllJobs = async (filters = {}, page = 1, limit = 10) => {
    const jobs = await repository.findAllJobs(filters, page, limit);
    const total = await repository.countJobs(filters);
    const totalPages = Math.ceil(total / limit);
    
    return {
      jobs,
      pagination: {
        current: page,
        total: totalPages,
        count: jobs.length,
        totalRecords: total
      }
    };
  };

Service.prototype.getJobById = async (id) => {
    return await repository.findJobById(id);
  };

Service.prototype.searchJobs = async (searchTerm, filters = {}, page = 1, limit = 10) => {
    const jobs = await repository.searchJobs(searchTerm, filters, page, limit);
    const total = await repository.countSearchJobs(searchTerm, filters);
    const totalPages = Math.ceil(total / limit);
    
    return {
      jobs,
      pagination: {
        current: page,
        total: totalPages,
        count: jobs.length,
        totalRecords: total
      }
    };
  };


module.exports = new Service();
