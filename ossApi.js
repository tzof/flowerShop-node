const { log } = require("console");
const client = require("./ossInfo.js");
const multer = require("multer");

const router = require("express").Router();
// 创建 Multer 中间件实例
const storage = multer.memoryStorage(); // 使用内存存储以避免文件写入磁盘
const upload = multer({ storage: storage }); // storage存储引擎，它定义了如何处理上传的文件

let fileName = "";
// 上传文件到 OSS
async function uploadFileToOSS(file) {
  fileName = "";
  try {
    let originalname = file.originalname; // 使用原始文件名
    let index = originalname.lastIndexOf(".");
    let name = originalname.substring(0, index);
    let typeName = originalname.substring(index + 1);
    fileName = name + "-" + new Date().getTime() + "." + typeName;
    await client.put(fileName, file.buffer);
    console.log(file);
    return `https://oss.tzof.net/${fileName}`;
  } catch (error) {
    console.error("上传文件失败:", error);
    throw error;
  }
}

// 下载文件
async function downloadFile() {
  try {
    const objectName = "<your-object-name>"; // 你想下载的对象名称
    const localFilePath = "<local-file-path>"; // 本地文件路径

    // 下载文件
    await client.getObject({
      key: objectName,
      target: localFilePath,
    });

    console.log(`File downloaded successfully to ${localFilePath}`);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

// 生成带签名的URL
async function generateSignedUrl() {
  try {
    const objectName = fileName;
    const expires = 3600; // 过期时间，单位秒
    // 生成带签名的URL
    const url = await client.signatureUrl(objectName, { expires });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
  }
}

// 文件上传路由
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    await uploadFileToOSS(req.file);
    const fileUrl = (await generateSignedUrl()).replace(
      "http://tzof-oss.oss-cn-hangzhou.aliyuncs.com",
      "https://oss.tzof.net"
    );
    console.log("文件上传成功文件名：", fileName, "访问地址：", fileUrl);
    res.json({
      code: 200,
      msg: `上传成功`,
      avatarUrl: fileUrl,
      fileName,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: 0, success: false, message: "文件上传失败" });
  }
});

// 文件下载
router.post("/upload", upload.single("file"), async (req, res) => {});

module.exports = router;
