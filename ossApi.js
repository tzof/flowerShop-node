const client = require("./ossInfo.js");
const multer = require("multer");
const express = require("express");

const app = express();

// 创建 Multer 中间件实例
const storage = multer.memoryStorage(); // 使用内存存储以避免文件写入磁盘
const upload = multer({ storage: storage });
// 上传文件到 OSS
async function uploadFileToOSS(file) {
  try {
    const fileName = file.originalname; // 使用原始文件名
    await client.put(fileName, file.buffer);
    return `https://tzof-oss.oss-cn-hangzhou.aliyuncs.com/${fileName}`;
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
