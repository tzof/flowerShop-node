const rp = require("request-promise-native");
const router = require("express").Router();
const pool = require("./mysqlInfo");
const jwt = require("jsonwebtoken");

/**
 * 登录
 * @swagger
 * /login:
 *   post:
 *     summary: 微信小程序登录
 *     tags: [Login]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["code"]
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信的临时登录凭证
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
 *                   defautl: 登录成功
 */
// 登录
router.post("/login", async (req, res) => {
  const { code } = req.body;
  const appId = process.env.WECHARTPROGRAM_APPID;
  const secret = process.env.WECHARTPROGRAM_SECRET;
  if (!code) {
    res.json({
      code: 0,
      msg: "code为空",
    });
    return;
  }
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
    let mysql = '';
    let dataArr = [];
    // 新用户创建ip
    if (isNewUser) {
      mysql = `INSERT INTO user (openId, createIp, updateIp) VALUES (?, ?, ?)`;
      dataArr = [response.openid, ip, ip];
    } else {
      // 老用户更新ip
      mysql = `UPDATE user SET updateIp = ? WHERE openId = ?`;
      dataArr = [ip, response.openid];
    }
    // sign()内 第一个参数表示要存储在token中的信息(在验证verify方法内返回的user内展示所以得为对象形式) 第二个参数表示代表了用于签名的密钥 第三个参数表示jwt过期时间单位秒
    const token = jwt.sign(
      { openid: response.openid },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: 60 * 60,
      }
    );
    // 创建或更新ip
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
