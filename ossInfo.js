const OSS = require("ali-oss");

// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new OSS({
  region: process.env.OSS_REGION, // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID, // 确保已设置环境变量OSS_ACCESS_KEY_ID。
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET, // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
  bucket: process.env.OSS_BUCKET, // 示例：'my-bucket-name'，填写存储空间名称。
  authorizationV4: true,
});

module.exports = client;
