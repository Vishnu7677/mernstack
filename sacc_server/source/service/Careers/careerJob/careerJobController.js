const service  = require('./careerJobService');

function Controller() {}

Controller.prototype.getAllJobs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = { isActive: true };
      
      // Add location filter if provided
      if (req.query.location) {
        filters.locations = { $in: [req.query.location] };
      }
      
      // Add employment type filter if provided
      if (req.query.employmentType) {
        filters.employmentType = req.query.employmentType;
      }

      const result = await service.getAllJobs(filters, page, limit);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };

 Controller.prototype.getJob = async (req, res) => {
    try {
      const job = await service.getJobById(req.params.id);
      
      if (!job) {
        return res.status(404).json({
          status: 'error',
          message: 'Job not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { job }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };

Controller.prototype.searchJobs = async (req, res) => {
    try {
      const { q, location, employmentType } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = { isActive: true };
      
      // Add filters if provided
      if (location) filters.locations = { $in: [location] };
      if (employmentType) filters.employmentType = employmentType;

      const result = await service.searchJobs(q, filters, page, limit);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };


module.exports = new Controller();
