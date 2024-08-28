const express = require("express");
const cors = require("cors");

const ossApi = require('./ossApi')

const https = require("https");
const fs = require("fs");

// 引入接口模块
// var api = require("./api.js");

const app = express();
// 跨域配置 模块
app.use(cors());


// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
// })

// app.use(api);

app.use(ossApi);


// 配置SSL证书和密钥
const options = {
  key: fs.readFileSync("/usr/local/nginx/conf/cert/tzof.net.key"), // 私钥位置
  cert: fs.readFileSync("/usr/local/nginx/conf/cert/tzof.net.pem"), // 证书位置
};

const server = https.createServer(options, app);

server.listen(217, () => {
  console.log("217已开启");
});
