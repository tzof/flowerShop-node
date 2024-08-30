const rp = require("request-promise-native");
const router = require("express").Router();

router.post("/login", async (req, res) => {
  const { code } = req.body;
  const appId = "appId";
  const secret = "secret";
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
    console.log(response);
    // 如果需要，你可以根据 openid 和 session_key 生成自定义的 token 并返回给客户端
    const token = response.session_key + response.openid;
    res.json({ token, openId: response.openid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
});

module.exports = router;
