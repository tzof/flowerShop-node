var express = require("express");
var cors = require("cors");
const https = require("https");
const fs = require("fs");

// 引入接口模块
// var api = require("./api.js");

var app = express();
// 跨域配置 模块
app.use(cors());

// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
// })

// app.use(api);

const OSS = require("ali-oss");

// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new OSS({
  region: "oss-cn-hangzhou", // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
  accessKeyId: "ak", // 确保已设置环境变量OSS_ACCESS_KEY_ID。
  accessKeySecret: "aks", // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
  bucket: "tzof-oss", // 示例：'my-bucket-name'，填写存储空间名称。
  authorizationV4: true,
});

const multer = require("multer");

// 创建 Multer 中间件实例
const storage = multer.memoryStorage(); // 使用内存存储以避免文件写入磁盘
const upload = multer({ storage: storage });
// 上传文件到 OSS
async function uploadFileToOSS(file) {
  try {
    let originalname = file.originalname; // 使用原始文件名
    let index = originalname.lastIndexOf(".");
    let name = originalname.substring(0, index);
    let typeName = originalname.substring(index + 1);
    let fileName = name + '-' + new Date().getTime() + '.' + typeName;
    await client.put(fileName, file.buffer);
    console.log(file);
    return `https://oss.tzof.net/${fileName}`;
  } catch (error) {
    console.error("上传文件失败:", error);
    throw error;
  }
}

// 文件上传路由
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFileToOSS(req.file);
    res.status(200).json({ success: true, fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: "文件上传失败" });
  }
});

// 配置SSL证书和密钥
const options = {
    key: fs.readFileSync('/usr/local/nginx/conf/cert/tzof.net.key'), // 私钥位置
    cert: fs.readFileSync('/usr/local/nginx/conf/cert/tzof.net.pem') // 证书位置
};

const server = https.createServer(options, app);



server.listen(217, () => {
  console.log("217已开启");
});
