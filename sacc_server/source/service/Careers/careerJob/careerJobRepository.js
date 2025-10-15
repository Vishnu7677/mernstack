const Job = require('../../../commons/models/mongo/documents/CareerJob');

function Repository() {}

Repository.prototype.findAllJobs = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await Job.find(filters)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);
  };

Repository.prototype.findJobById = async (id) => {
    return await Job.findById(id);
  };

Repository.prototype.countJobs = async (filters = {}) => {
    return await Job.countDocuments(filters);
  };

Repository.prototype.searchJobs = async (searchTerm, filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const searchFilter = {
      ...filters,
      $or: [
        { jobName: { $regex: searchTerm, $options: 'i' } },
        { company: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    return await Job.find(searchFilter)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);
  };

Repository.prototype.countSearchJobs = async (searchTerm, filters = {}) => {
    const searchFilter = {
      ...filters,
      $or: [
        { jobName: { $regex: searchTerm, $options: 'i' } },
        { company: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    return await Job.countDocuments(searchFilter);
  };

module.exports = new Repository();
