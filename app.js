const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

// 加载环境变量
require("dotenv").config();

const ossApi = require("./ossApi");
const loginApi = require("./login");
const userinfoApi = require("./userInfo");
const homeApi = require("./home");
const goodsApi = require("./goods");
const departmentsApi = require("./departments");
const categoryApi = require("./category");
const shoppingCartApi = require("./shoppingCart");
const addressApi = require("./address");
const ordersApi = require("./orders");

const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger"); // 引入你之前配置的swagger.js

const https = require("https");
const fs = require("fs");

const app = express();
// 跨域配置 模块
app.use(cors());

// swagger文档
app.use(
  process.env.SWAGGER_API_PATH,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

// 解析json
app.use(express.json());
// 解析x-www-form-urlencoded数据
app.use(bodyParser.urlencoded({ extended: false }));
// JWT 验证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader &&
    (authHeader.split(" ")[1] ? authHeader.split(" ")[1] : authHeader); // 解析Bearer JWT格式的token
  // 如果没有提供 token，则返回 403 Forbidden禁止进入的
  if (!token) {
    return res.json({
      code: 403,
      msg: "token未提供",
    });
  }
  // verify()验证JWT的合法性和完整性 第一个参数要解析的token 第二个参数是密钥 第三个参数是回调函数(err,user)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    // data中存的是jwt.sign(data,key,time)创建jwt的时候存入的数据data
    // 如果 token 无效或已过期，则返回 403 Forbidden禁止进入的
    if (err) {
      return res.json({
        code: 403,
        msg: "token失效或过期",
      });
    }
    // console.log("jwt token解析数据", data);
    const method = req.method;
    if (method == "GET") {
      req.query.openId = data.openId;
    } else if (method == "POST") {
      req.body.openId = data.openId;
    }
    next();
  });
}

// 设置全局中间件验证所有接口请求头是否包含token并合法，但允许特定路由绕过验证
app.use((req, res, next) => {
  const publicRoutes = ["/login"]; // 允许特定路由绕过验证
  const routeNeedsAuth = !publicRoutes.includes(req.path);
  console.log("请求路径", req.path);
  console.log("是否需要验证", routeNeedsAuth);
  console.log("请求方式", req.method);
  console.log("请求头", req.headers);
  console.log("请求体", req.body);
  console.log("请求参数", req.query);
  // console.log("响应体", res.body);
  if (routeNeedsAuth) {
    if (process.env.JWT_STATUS == "true") {
      authenticateToken(req, res, next);
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use(ossApi); // 阿里oss
app.use(loginApi); // 登录
app.use(userinfoApi); // 用户
app.use(homeApi); // 主页接口
app.use(goodsApi); // 商品
app.use(departmentsApi);
app.use(categoryApi); // 分类
app.use(shoppingCartApi); // 购物车
app.use(addressApi); // 地址
app.use(ordersApi); // 订单

if (process.env.HTTPS_STATUS == "true") {
  // 配置SSL证书和密钥
  const options = {
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH), // 私钥位置
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH), // 证书位置
  };

  const server = https.createServer(options, app);

  server.listen(process.env.HTTPS_PORT, () => {
    console.log("https-" + process.env.HTTPS_PORT + "-已开启");
  });
} else {
  app.listen(process.env.HTTP_PORT, () => {
    console.log("http-" + process.env.HTTP_PORT + "-已开启");
  });
}
