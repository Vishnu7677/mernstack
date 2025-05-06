const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/route/*.js'];

const config = {
    info: {
        title: 'Blog API Documentation',
        description: '',
    },
    tags: [ ],
    host: 'localhost:5000/api',
    schemes: ['http', 'https'],
};

swaggerAutogen(outputFile, endpointsFiles, config);