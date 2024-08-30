const express = require("express");
const cors = require("cors");

// 加载环境变量
require("dotenv").config();

const ossApi = require("./ossApi");
const loginApi = require("./login");
const userinfoApi = require("./userInfo");

const https = require("https");
const fs = require("fs");




// 引入接口模块
// var api = require("./api.js");

const app = express();
// 跨域配置 模块
app.use(cors());

// 解析json
app.use(express.json());

// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
// })

// app.use(api);

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
