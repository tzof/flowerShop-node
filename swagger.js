const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "花城api文档",
      version: "1.0.0",
      description:
        "nodejs+express+mysql+swagger+aliyunoss实现花城小程序后台api文档",
    },
    
    components: { // 全局自定义组件
      parameters: { // 定义全局参数 params传参和head传参使用
        AuthHeader: { // 自定义参数名称
          in: "header", // 指定参数位置 header表示请求头 path表示get的params的传参
          name: "authorization", // 参数名称
          description: "添加authorization认证", // 描述
          required: true, // 是否必填
          type: "string", // 指定参数类型
        },
      },
      securitySchemes: { // 定义全局安全方案机制 使用的时候security内调用 security: - jwtAuth: []
        jwtAuth: { // 自定义安全方案名称
          type: "http", // 指定安全方案的类型，http类型用于定义基于HTTP协议的安全方案 包括scheme内bearer、basic、digest等子类型。https请求也使用http。
          scheme: "bearer", // 指定认证方案类型，持有者令牌（bearer token）
          bearerFormat: "JWT", // 指定bearer后面的令牌类型，Bearer JWT
        },
      },
    },
    servers: [
      {
        url: "https://tzof.net:217", // 根据实际情况修改
      },
    ],
  },
  apis: ["./*.js"], // 可以指定文件或目录
};

const specs = swaggerJsDoc(options);

module.exports = specs;

// JSDoc注释 写法说明

// post方法 传递json、form-data、x-www-form-urlencoded数据
/**
 * 获取用户信息
 * swagger // 告诉swagger-jsdoc工具，接下来的注释应该被解析为@swagger或@openapi文档的一部分。
 * /setUserinfo:  // 接口路由
 *   post: // 请求方式
 *     summary: 根据openId获取用户信息 // 总结概述
 *     tags: [User]  // 标签，可以将API归类到一个或多个标签下
 *     requestBody: // 请求体,（request body）的信息
 *       required: true // 是否必填
 *       content: // 描述请求体的内容类型和结构
 *         application/json: // 指定了请求体的内容类型为JSON，可以为multipart/form-data等请求体的格式
 *           schema: // 开始定义请求体内容的模式
 *             type: object // 指定了请求体内容数据类型
 *             properties: // 开始列出对象中的属性
 *               openId:  // 属性名
 *                 type: string // 属性数据类型
 *                 description: 用户唯一标识码 // 描述性的说明
 *     responses: // 响应结果 返回报文
 *       200: // 定义了HTTP状态码为200时的情况
 *         description: 成功获取用户信息 // 描述性的说明
 *         content: //  描述相应体的内容类型和结构
 *           application/json: // 指定相应的内容类型为JSON
 *             schema: // 开始定义响应体的内容模式
 *               type: object // 指定了响应体内容数据类型
 *               properties: // 开始列出对象中的属性
 *                 id: // 属性名
 *                   type: string // 属性数据类型
 *                 name: // 属性名
 *                   type: string // 属性数据类型
 *       400: // 定义了HTTP状态码为400时的情况
 *         description: 请求参数错误 // 描述性的说明
 */

// get方法
/**
 * 获取用户信息
 * swagger // 告诉swagger-jsdoc工具，接下来的注释应该被解析为@swagger或@openapi文档的一部分。
 * /setUserinfo:  // 接口路由
 *   get: // 请求方式
 *     summary: 根据openId获取用户信息 // 总结概述
 *     tags: [User]  // 标签，可以将API归类到一个或多个标签下
 *     parameters: // 定义请求体参数 get的params传参 请求头header传参
 *       - in: query // 指定参数位置 query表示get的params的传参
 *         name: openId // 参数名称
 *         required: true // 是否必填
 *         schema: //  开始定义请求体内容的模式
 *           type: string // 数据类型
 *     security: // 指定访问API的安全机制
 *       - jwtAuth: [] // 使用指定的安全方案（自定义安全方案名称），在全局组件的securitySchemes定义。[]空数组表明了安全方案的参数，因为JWT通常不需要额外的参数因此这里使用空数组。
 *     responses: // 响应结果 返回报文
 *       200: // 定义了HTTP状态码为200时的情况
 *         description: 成功获取用户信息 // 描述性的说明
 *         content: //  描述相应体的内容类型和结构
 *           application/json: // 指定相应的内容类型为JSON
 *             schema: // 开始定义响应体的内容模式
 *               type: object // 指定了响应体内容数据类型
 *               properties: // 开始列出对象中的属性
 *                 id: // 属性名
 *                   type: string // 属性数据类型
 *                 name: // 属性名
 *                   type: string // 属性数据类型
 *       400: // 定义了HTTP状态码为400时的情况
 *         description: 请求参数错误 // 描述性的说明
 */
