const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取购物车总数
router.get("/getShoppingCartTotal", async (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  let mysql = `
   SELECT COUNT(*) AS total FROM shopping_cart WHERE openId = '${openId}'
  `;
  await pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "获取购物车总数成功",
      data: data[0][0],
    });
  });
});

// 获取购物车
router.get("/getShoppingCart", async (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  console.log(reqData);
  let mysql = `
    SELECT * FROM shopping_cart WHERE openId = '${openId}' ORDER BY createTime DESC;
  `;
  await pool.query(mysql).then((data) => {
    let promiseArr = [];
    data[0].forEach((item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        let goodsId = item.goodsId;
        // 查询商品信息并存入返回数据
        mysql = `
          SELECT * FROM goods WHERE goodsId = ${goodsId};
        `;
        await pool
          .query(mysql)
          .then((data) => {
            item.goodsInfo = data[0][0];
            item.totalPrice = item.goodsInfo.discounted_price * item.count;
          })
          .catch((err) => {
            console.log("error:查找购物车商品详情出错", err);
          });
        resolve();
      });
      promiseArr.push(promiseItem);
    });
    Promise.all(promiseArr).then(() => {
      res.json({
        code: 200,
        msg: "获取购物车成功",
        data: data[0],
      });
    });
  });
});

// 添加修改购物车
router.post("/setShoppingCart", async (req, res) => {
  const reqData = req.body;
  let { openId, goodsId, count } = reqData;
  goodsId = Number(goodsId);
  count = Number(count);
  if (count === 0 || count < 0) {
    let mysql = `
      DELETE FROM shopping_cart WHERE openId = '${openId}' AND goodsId = ${goodsId};
    `;
    await pool.query(mysql).then((data) => {
      res.json({
        code: 200,
        msg: "删除购物车成功",
      });
    });
    return;
  }
  // 查询是否为新购物车商品
  let mysql = `
    SELECT * FROM shopping_cart WHERE openId = '${openId}' AND goodsId = ${goodsId};
  `;
  await pool
    .query(mysql)
    .then(async (data) => {
      let isNewShopCar = false;
      // 没有则创建购物车
      if (data[0].length === 0) {
        isNewShopCar = true;
        // 如果有传count则修改数量 没有则为1
        count = count ? count : 1;
        mysql = `
        INSERT INTO shopping_cart (openId, goodsId, count) VALUES ('${openId}', ${goodsId}, ${count});
      `;
      }
      // 已在购物车商品修改
      else {
        // 如果有传count则修改数量 没有则自增
        count = count ? count : data[0][0].count + 1;
        mysql = `
        UPDATE shopping_cart SET count = ${count} WHERE openId = '${openId}' AND goodsId = ${goodsId};
      `;
      }
      await pool
        .query(mysql)
        .then((data) => {
          res.json({
            code: 200,
            msg: (isNewShopCar ? "添加" : "修改") + "购物车成功",
          });
        })
        .catch((err) => {
          console.log("error:" + err);
        });
    })
    .catch((err) => {
      console.log("error:" + err);
    });
});

// 删除购物车
router.post("/deleteShoppingCart", (req, res) => {
  const reqData = req.body;
  const { carId } = reqData;
  let mysql = `
    DELETE FROM shopping_cart WHERE carId = ${Number(carId)};
  `;
  pool.query(mysql).then((data) => {
    res.json({
      code: 200,
      msg: "删除购物车成功",
    });
  });
});

// 购物车点击结算下单成功后减少购物车内商品数量
router.post("/setShoppingCartCount", async (req, res) => {
  const reqData = req.body;
  const { goodsId, count } = reqData;
  let mysql = `
    UPDATE shopping_cart SET count = ${count} WHERE goodsId = ${Number(
    goodsId
  )};
  `;
  await pool.query(mysql).then((data) => {
    res.json({
      code: 200,
    });
  });
});

// 修改购物车选择状态
router.post("/setShoppingCartSelect", async (req, res) => {
  const reqData = req.body;
  const { carId, isSelect = 0 } = reqData;
  let mysql = `
    UPDATE shopping_cart SET isSelect = ${isSelect} WHERE carId = ${Number(
    carId
  )};
  `;
  await pool.query(mysql).then((data) => {
    res.json({
      code: 200,
      msg: "修改购物车选择状态成功",
    });
  });
});

// 全选修改购物车选择状态
router.post("/setShoppingCartAllSelect", async (req, res) => {
  const reqData = req.body;
  const { openId, isSelect = 0 } = reqData;
  let mysql = `
    UPDATE shopping_cart SET isSelect = ${isSelect} WHERE openId = '${openId}';
  `;
  await pool.query(mysql).then((data) => {
    res.json({
      code: 200,
      msg: "修改全选购物车选择状态成功",
    });
  });
});

module.exports = router;
