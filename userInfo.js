const router = require("express").Router();
const pool = require("./mysqlInfo");

router.post("/setUserinfo", async (req, res) => {
  const reqData = req.body;
  let isNewUser = false; // 判断是否为新用户
  await pool
    .query("SELECT * FROM user WHERE openId = ?", [reqData.openId])
    .then((data) => {
      // rows第一元素查询结果 fields第二元素字段元数据例如字段名、数据类型等。
      // rows和fields不是特定关键字随便换个变量也表示第一个和第二个元素 es6赋值
      const [rows, fields] = data;
      isNewUser = rows.length > 0 ? false : true;
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: `查询失败，${err}`,
      });
    });
  const ip = String(req.ip);
  const keyArr = Object.keys(reqData);
  let valueArr = Object.values(reqData);
  let dataArr = [];
  // 新用户创建
  if (isNewUser) {
    mysql = `INSERT INTO user (openId, nickName, avatarUrl, createIp, updateIp) VALUES (?, ?, ?, ?, ?)`;
    dataArr = [reqData.openId, reqData.nickName, reqData.avatarUrl, ip, ip];
  } else {
    // 老用户更新
    let str = "";
    keyArr.forEach((item) => {
      item != "openId" && (str += `${item} = ?,`);
    });
    mysql = `UPDATE user SET ${str} updateIp = ? WHERE openId = ?`;
    valueArr = valueArr.filter((item) => item != reqData.openId);
    dataArr = [...valueArr, ip, reqData.openId];
  }
  console.log(mysql, dataArr);
  await pool
    .query(mysql, dataArr)
    .then((data) => {
      res.json({
        code: 200,
        msg: `${isNewUser ? "创建" : "更新"}用户信息成功`,
      });
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: `查询失败，${err}`,
      });
    });
});

module.exports = router;
