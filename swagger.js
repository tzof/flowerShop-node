const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "TZOF花城小程序api文档",
      version: "1.0.0",
      description:
        "nodejs+express+mysql2+swagger+aliyunOssSDK实现花城小程序后台api文档",
    },
    
    components: { // 全局自定义组件
      // parameters: { // 定义全局参数，query传参和设置header请求头使用
      //   XCustomHeader: { // 自定义组件名
      //     in: "header", // 指定参数位置 header表示请求头 query表示get的query的传参
      //     name: "X-Custom-Header", // 参数名称
      //     type: "string", // 指定参数类型
      //     description: "改变请求头X-Custom-Header", // 描述
      //     required: true, // 是否必填
      //   },
      // },
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
        url: process.env.SWAGGER_HOST, // 根据实际情况修改
      },
    ],
  },
  apis: ["./*.js"], // 可以指定文件或目录
};

const specs = swaggerJsDoc(options);

module.exports = specs;

// JSDoc注释 写法说明
// https://editor.swagger.io/?spm=5176.28103460.0.0.32735d27VIMi8d 官方编辑器可以验证和参考里面的yaml文件
/**
 * swagger // 告诉swagger-jsdoc工具，接下来的注释应该被解析为@swagger或@openapi文档的一部分。
 * /setUserinfo:  // 接口路由
 *   post: // 请求方式
 *     summary: 根据openId获取用户信息 // 总结概述
 *     tags: [User]  // 标签，可以将API归类到一个或多个标签下
 *     security: // 设置访问API的安全机制(认证机制)
 *       - jwtAuth: [] // 使用指定的安全方案（自定义安全方案名称），在全局组件的securitySchemes定义。[]空数组表明了安全方案的参数，因为JWT通常不需要额外的参数因此这里使用空数组。
 *     parameters: // 定义param参数。query数据传参或者设置header请求头的时候使用
 *       - in: query // 指定参数位置 get请求的query传参
 *         name: openId // 参数名称
 *         required: true // 是否必填
 *         description: 用户openid // 描述 注意是写在schema同层
 *         schema: // 开始定义内容
 *           type: string // 数据类型 
 *       - in: header // 指定参数位置 设置请求头
 *         name: X-Custom-Header // 请求头的名称
 *         required: true // 是否必填
 *         description: 请求头 // 描述 注意是写在schema同层
 *         schema: // 开始定义内容
 *           type: string // 数据类型
 *     requestBody: // 定义请求体,req.body(request body)的信息。 传递application/json、multipart/form-data、application/x-www-form-urlencoded数据的时候使用
 *       required: true // 是否必填。对于整个请求体不是指定某个字段。
 *       description: 需要的请求体 // 对于整个请求体的描述。
 *       content: // 开始定义请求体内容
 *         application/json: // 指定了请求体内容格式为json，可以为application/json、multipart/form-data、application/x-www-form-urlencoded等请求体的格式
 *           schema: // 开始定义内容
 *             type: object // 内容的数据类型
 *             required: ["openId"] // 指定对象内的必填字段
 *             properties: // 开始定义对象的属性
 *               openId:  // 属性名，定义该属性下的配置
 *                 type: string // 数据类型
 *                 default: "" // 默认值。在对象中如果不设置默认值为""空字符串在特殊情况下对应输入框内会默认显示type定义的值，如"string"
 *                 description: 用户的openId // 描述
 *               avatarUrl: // 属性名，定义该属性下的配置
 *                 type: string // 数据类型
 *                 default: "" // 默认值。
 *                 description: 头像地址 // 描述
 *               file: // 属性名，定义该属性下的配置
 *                 type: string // 数据类型
 *                 format: binary // 表示该字符串实际上是一个二进制数据流，即一个文件流。
 *                 description: 上传的文件 // 描述
 *     responses: // 响应结果 返回报文
 *       200: // 定义了HTTP状态码为200的时候的响应结果
 *         description: 成功获取用户信息 // 返回结果整体描述
 *         content: // 开始定义返回体内容
 *           application/json: // 指定了返回内容类型为json
 *             schema: // 开始定义内容
 *               type: object // 内容的数据类型
 *               properties: // 开始定义对象的属性
 *                 data: // 属性名
 *                   type: string // 属性数据类型
 *                 msg: // 属性名
 *                   type: string // 属性数据类型
 *                   default: 成功 // 默认值
 *       400: // 定义了HTTP状态码为400的时候的响应结果
 *         description: 请求参数错误 // 返回结果整体描述
 */
