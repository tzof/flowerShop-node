const router = require("express").Router();
const pool = require("./mysqlInfo");
const client = require("./ossInfo.js");
// 生成带签名的URL oss签名URL
async function generateSignedUrl(fileName) {
  try {
    const objectName = fileName;
    const expires = 3600; // 过期时间，单位秒
    // 生成带签名的URL
    const url = await client.signatureUrl(objectName, { expires });
    console.log(url, "++++++++++++++++++");
    return url;
  } catch (error) {
    console.error(
      "Error generating signed URL:",
      error,
      "+++++++++++++++++++++++++++"
    );
  }
}

//  *     parameters:
//  *       - in: query
//  *         name: openId
//  *         required: true
//  *         schema:
//  *           type: string
/**
 * 获取用户信息
 * @swagger
 * /getUserinfo:
 *   get:
 *     summary: 获取用户信息
 *     tags: [User]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openId:
 *                   type: string
 *                 nickname:
 *                   type: string
 *                 avatarfileName:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 */
// 获取用户信息
router.get("/getUserinfo", async (req, res) => {
  const { openId } = req.query;
  const mysql = `SELECT * FROM user WHERE openId = ?`;
  await pool.query(mysql, [openId]).then(async (data) => {
    let resData = data[0][0];
    console.log(req.body, data, "获取用户信息成功", resData);
    const avatarUrl = (
      resData && (await generateSignedUrl(resData.avatarfileName))
    )?.replace(
      "http://tzof-oss.oss-cn-hangzhou.aliyuncs.com",
      "https://oss.tzof.net"
    );
    resData.avatarUrl = avatarUrl;
    res.json({
      code: 200,
      msg: "获取用户信息成功",
      data: resData,
    });
  });
});

/**
 * 设置用户信息
 * @swagger
 * /setUserinfo:
 *   post:
 *     summary: 设置用户信息
 *     tags: [User]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["avatarfileName","avatarUrl","nickname"]
 *             properties:
 *               avatarfileName:
 *                 type: string
 *                 default: ""
 *                 description: oss接口返回的头像文件名
 *               avatarUrl:
 *                 type: string
 *                 default: ""
 *                 description: oss接口返回的头像地址
 *               nickname:
 *                 type: string
 *                 default: ""
 *                 description: 昵称
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 创建/更新用户信息成功
 */
// 设置用户信息
router.post("/setUserinfo", async (req, res) => {
  const reqData = req.body;
  const ip = String(req.ip);
  const keyArr = Object.keys(reqData);
  let valueArr = Object.values(reqData);
  let dataArr = [];
  // 更新用户信息
  let str = "";
  keyArr.forEach((item) => {
    item != "openId" && (str += `${item} = ?,`);
  });
  mysql = `UPDATE user SET ${str} updateIp = ? WHERE openId = ?`;
  valueArr = valueArr.filter((item) => item != reqData.openId);
  dataArr = [...valueArr, ip, reqData.openId];
  console.log(mysql, dataArr);
  await pool
    .query(mysql, dataArr)
    .then((data) => {
      console.log(`${"更新"}用户信息成功，数据库返回：${data[0]}`);
      res.json({
        code: 200,
        msg: `${"更新"}用户信息成功`,
      });
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: `创建/更新用户信息失败，${err}`,
      });
    });
});

module.exports = router;
