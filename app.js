const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// 加载环境变量
require("dotenv").config();

const ossApi = require("./ossApi");
const loginApi = require("./login");
const userinfoApi = require("./userInfo");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger"); // 引入你之前配置的swagger.js
const https = require("https");
const fs = require("fs");

const app = express();
// 跨域配置 模块
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// JWT 验证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 解析Bearer JWT格式的token
  if (token == null) return res.sendStatus(401); // 如果没有提供 token，则返回 401 Unauthorized
  // verify()验证JWT的合法性和完整性 第一个参数要解析的token 第二个参数是密钥 第三个参数是回调函数(err,user)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // 如果 token 无效或已过期，则返回 403 Forbidden
    req.user = user; // 将解码后的用户信息附加到请求对象上
    console.log(user);
    next();
  });
}

// 设置全局中间件验证所有接口请求头是否包含token并合法，但允许特定路由绕过验证
app.use((req, res, next) => {
  const publicRoutes = ["/login"]; // 允许特定路由绕过验证
  const routeNeedsAuth = !publicRoutes.includes(req.path);
  if (routeNeedsAuth) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
});

// 解析json
app.use(express.json());

app.use(ossApi);
app.use(loginApi);
app.use(userinfoApi);

// 配置SSL证书和密钥
const options = {
  key: fs.readFileSync("/usr/local/nginx/conf/cert/tzof.net.key"), // 私钥位置
  cert: fs.readFileSync("/usr/local/nginx/conf/cert/tzof.net.pem"), // 证书位置
};

const server = https.createServer(options, app);

server.listen(217, () => {
  console.log("217已开启");
});
