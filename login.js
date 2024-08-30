const rp = require("request-promise-native");
const router = require("express").Router();
const pool = require("./mysqlInfo");

router.post("/login", async (req, res) => {
  const { code } = req.body;
  const appId = process.env.WECHARTPROGRAM_APPID;
  const secret = process.env.WECHARTPROGRAM_SECRET;
  try {
    const options = {
      uri: `https://api.weixin.qq.com/sns/jscode2session`,
      qs: {
        appid: appId,
        secret: secret,
        js_code: code,
        grant_type: "authorization_code",
      },
      json: true,
    };
    const response = await rp(options);
    console.log("登录信息：", response);
    // 进入小程序自动注册openId为账号
    await pool
      .query("SELECT * FROM user WHERE openId = ?", [response.openid])
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
    // 新用户创建ip
    if (isNewUser) {
      mysql = `INSERT INTO user (openId, createIp, updateIp) VALUES (?, ?, ?)`;
      dataArr = [response.openid, ip, ip];
    } else {
      // 老用户更新ip
      mysql = `UPDATE user SET updateIp = ? WHERE openId = ?`;
      dataArr = [ip, response.openid];
    }
    const token = response.session_key + response.openid;
    await pool
      .query(mysql, dataArr)
      .then((data) => {
        console.log(
          `${isNewUser ? "注册" : "更新"}用户ip成功，用户id：${
            response.openid
          }，用户ip：${ip}`
        );

        res.json({
          code: 200,
          msg: `${isNewUser ? "注册" : "更新"}用户ip成功`,
          token,
          openId: response.openid,
          ip,
        });
      })
      .catch((err) => {
        res.json({
          code: 0,
          msg: `创建/更新ip失败，${err}`,
        });
      });
  } catch (error) {
    console.error(error);
    res.json({ code: 0, error: "Failed to login" });
  }
});

module.exports = router;
