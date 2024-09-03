const router = require("express").Router();
const pool = require("./mysqlInfo");
/**
 * 获取用户信息
 * @openapi
 * /getUserinfo:
 *   get:
 *     summary: 根据openId获取用户信息
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: openId
 *         required: true
 *         schema:
 *           type: string
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
  const openId = req.query.openId;
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
// *       - in: header
// *         name: X-Custom-Header
// *         required: true
// *         schema:
// *           type: string
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
