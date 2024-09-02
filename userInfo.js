const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取用户信息
router.post("/getUserinfo", async (req, res) => {
  const openId = req.body.openId;
  const mysql = `SELECT * FROM user WHERE openId = ?`;
  await pool.query(mysql, [openId]).then((data) => {
    console.log("获取用户信息成功", data[0]);
    res.json({
      code: 200,
      msg: "获取用户信息成功",
      data: data[0],
    });
  });
});
/**
 * 获取用户登录Token
 * @swagger
 * /user:
 *   get:
 *     summary: 根据登录凭证code获取Token
 *     description: 用户通过此接口发送他们的登录凭证code以换取一个访问令牌。
 *     tags: [用户管理]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: 登录凭证code，从前端获取
 *     responses:
 *       200:
 *         description: 成功响应，返回包含Token的对象
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 错误响应，如果code无效或缺少
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing code."
 */
// 设置用户信息
router.post("/setUserinfo", async (req, res) => {
  console.log(req.path);

  const reqData = req.body;
  let isNewUser = false; // 判断是否为新用户
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
      console.log(
        `${isNewUser ? "创建" : "更新"}用户信息成功，数据库返回：${data[0]}`
      );
      res.json({
        code: 200,
        msg: `${isNewUser ? "创建" : "更新"}用户信息成功`,
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
