const client = require("./ossInfo.js");
const multer = require("multer");

const router = require("express").Router();
// 创建 Multer 中间件实例
const storage = multer.memoryStorage(); // 使用内存存储以避免文件写入磁盘
const upload = multer({ storage: storage }); // storage存储引擎，它定义了如何处理上传的文件
// 上传文件到 OSS
async function uploadFileToOSS(file) {
  try {
    let originalname = file.originalname; // 使用原始文件名
    let index = originalname.lastIndexOf(".");
    let name = originalname.substring(0, index);
    let typeName = originalname.substring(index + 1);
    let fileName = name + "-" + new Date().getTime() + "." + typeName;
    await client.put(fileName, file.buffer);
    console.log(file);
    return `https://oss.tzof.net/${fileName}`;
  } catch (error) {
    console.error("上传文件失败:", error);
    throw error;
  }
}

// 文件上传路由
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFileToOSS(req.file);
    res.json({
      code: 200,
      msg: `上传成功`,
      avatarUrl: fileUrl,
    });
  } catch (error) {
    res.json({ code: 0, success: false, message: "文件上传失败" });
  }
});

// 文件下载
router.post("/upload", upload.single("file"), async (req, res) => {})

module.exports = router;
