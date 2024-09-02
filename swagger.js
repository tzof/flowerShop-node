const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "A sample API documentation",
    },
    servers: [
      {
        url: "http://localhost:217", // 根据实际情况修改
      },
    ],
  },
  apis: ["./*.js"], // 可以指定文件或目录
};

const specs = swaggerJsDoc(options);

module.exports = specs;