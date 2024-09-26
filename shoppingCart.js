const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取购物车总数
router.get("/getShoppingCartTotal", (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  console.log(openId);
  let mysql = `
   SELECT COUNT(*) AS total FROM shopping_cart WHERE openId = '${openId}'
  `;
  pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "获取购物车总数成功",
      data: data[0][0],
    });
  });
});

// 获取购物车
router.get("/getShoppingCart", (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  console.log(reqData);
  let mysql = `
    SELECT * FROM shopping_cart WHERE openId = '${openId}';
  `;
  pool.query(mysql).then((data) => {
    let promiseArr = [];
    data[0].forEach((item) => {
      let promiseItem = new Promise((resolve, reject) => {
        let goodsId = item.goodsId;
        // 查询商品信息并存入返回数据
        mysql = `
          SELECT * FROM goods WHERE goodsId = ${goodsId};
        `;
        pool
          .query(mysql)
          .then((data) => {
            item.goodsInfo = data[0][0];
          })
          .catch((err) => {
            console.log("error:查找购物车商品详情出错", err);
          });
        resolve();
      });
      promiseArr.push(promiseItem);
    });
    Promise.all(promiseArr).then(() => {
      console.log(data[0]);
      res.json({
        code: 200,
        msg: "获取购物车成功",
        data: data[0],
      });
    });
  });
});
// 添加修改购物车
router.post("/setShoppingCart", (req, res) => {
  const reqData = req.body;
  let { openId, goodsId, count } = reqData;
  goodsId = Number(goodsId);
  count = Number(count);
  if (count === 0 || count < 0) {
    let mysql = `
      DELETE FROM shopping_cart WHERE openId = '${openId}' AND goodsId = ${goodsId};
    `;
    pool.query(mysql).then((data) => {
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
  pool
    .query(mysql)
    .then((data) => {
      console.log(data[0]);
      let isNewShopCar = false;
      // 没有则创建购物车
      if (data[0].length === 0) {
        isNewShopCar = true;
        mysql = `
        INSERT INTO shopping_cart (openId, goodsId, count) VALUES ('${openId}', ${goodsId}, ${count});
      `;
      }
      // 已在购物车商品修改
      else {
        mysql = `
        UPDATE shopping_cart SET count = ${count} WHERE openId = '${openId}' AND goodsId = ${goodsId};
      `;
      }
      console.log(mysql);
      pool
        .query(mysql)
        .then((data) => {
          setTimeout(() => {
            res.json({
              code: 200,
              msg: (isNewShopCar ? "添加" : "修改") + "购物车成功",
            });
          }, 5000);
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
module.exports = router;
