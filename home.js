const router = require("express").Router();
const pool = require("./mysqlInfo");

// 首页轮播图
router.get("/home/carousel", async (req, res) => {
  const data = req.query;
  await pool.query("SELECT * FROM home_carousel").then((data) => {
    let resData = data[0];
    res.json({
      code: 200,
      msg: "获取首页轮播图成功",
      data: resData,
    });
  });
});

// 首页nav商品分类
router.get("/home/nav", async (req, res) => {
  const data = req.query;
  await pool.query("SELECT * FROM home_nav").then((data) => {
    let resData = data[0];
    res.json({
      code: 200,
      msg: "获取首页nav商品分类成功",
      data: resData,
    });
  });
});

// 首页活动activity
router.get("/home/activity", async (req, res) => {
  const data = req.query;
  await pool.query("SELECT * FROM home_activity").then((data) => {
    let resData = data[0];
    res.json({
      code: 200,
      msg: "获取首页活动成功",
      data: resData,
    });
  });
});

module.exports = router;
