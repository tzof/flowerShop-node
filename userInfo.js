const router = require("express").Router();
const pool = require("./mysqlInfo");

router.post("/setUserinfo", async (req, res) => {
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
