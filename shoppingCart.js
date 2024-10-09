const router = require("express").Router();
const pool = require("./mysqlInfo");

// 查询购物车总数
/**
 * @swagger
 * /getShoppingCartTotal:
 *   get:
 *     summary: 查询购物车总数
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: 成功查询购物车总数
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 查询购物车总数成功
 */
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

// 获取购物车列表
/**
 * @swagger
 * /getShoppingCart:
 *   get:
 *     summary: 获取购物车列表
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: 成功获取购物车列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取购物车列表成功
 */
router.get("/getShoppingCart", async (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  // 获取连接
  const connection = await pool.getConnection().catch((err) => {
    console.log(err);
    throw err;
  });
  // 开始事务 只有connection连接下的原型链才包含beginTransaction pool连接池无法直接调用
  await connection.beginTransaction().catch((err) => {
    console.log(err);
    connection.release();
    throw err;
  });
  try {
    let mysql = `
    SELECT * FROM shopping_cart WHERE openId = '${openId}' ORDER BY createTime DESC;
  `;
    await connection.query(mysql).then((data) => {
      let promiseArr = [];
      data[0].forEach((item) => {
        const promiseItem = new Promise(async (resolve, reject) => {
          let goodsId = item.goodsId;
          // 查询商品信息并存入返回数据
          mysql = `
          SELECT * FROM goods WHERE goodsId = ${goodsId};
        `;
          await connection
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
      Promise.all(promiseArr)
        .then(async () => {
          // 提交事务
          await connection.commit().then(() => {
            res.json({
              code: 200,
              msg: "获取购物车成功",
              data: data[0],
            });
          });
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err + "获取购物车失败",
    });
    // 回滚当前的事务
    await connection.rollback();
  } finally {
    // 释放连接 将连接返回到连接池
    await connection.release();
  }
});

// 修改购物车选择状态
/**
 * @swagger
 * /setShoppingCartSelect:
 *   post:
 *     summary: 修改购物车选择状态
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["carId","isSelect"]
 *             properties:
 *               carId:
 *                 type: string
 *                 default: ""
 *                 description: 购物车id
 *               isSelect:
 *                 type: string
 *                 default: ""
 *                 description: 是否选中，0 未选中，1 选中
 *     responses:
 *       200:
 *         description: 成功修改购物车选择状态
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 修改购物车选择状态成功
 */
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
/**
 * @swagger
 * /setShoppingCartAllSelect:
 *   post:
 *     summary: 全选修改购物车选择状态
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["isSelect"]
 *             properties:
 *               isSelect:
 *                 type: string
 *                 default: ""
 *                 description: 是否全选中，0 未选中，1 选中
 *     responses:
 *       200:
 *         description: 成功全选修改购物车选择状态
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 全选修改购物车选择状态成功
 */
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

// 添加/修改购物车
/**
 * @swagger
 * /setShoppingCart:
 *   post:
 *     summary: 添加/修改购物车
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["goodsId"]
 *             properties:
 *               goodsId:
 *                 type: string
 *                 default: ""
 *                 description: 商品id
 *               count:
 *                 type: string
 *                 default: ""
 *                 description: 数量，没在购物车中商品不传数量则默认为1，已在购物车中商品不传数量则默认自增1
 *     responses:
 *       200:
 *         description: 成功添加/修改购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 添加/修改购物车成功
 */
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
        INSERT INTO shopping_cart (openId, goodsId, count, isSelect) VALUES ('${openId}', ${goodsId}, ${count}, 1);
      `;
      }
      // 已在购物车商品修改
      else {
        // 如果有传count则修改数量 没有则自增
        count = count ? count : data[0][0].count + 1;
        mysql = `
        UPDATE shopping_cart SET count = ${count}, isSelect = 1 WHERE openId = '${openId}' AND goodsId = ${goodsId};
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
/**
 * @swagger
 * /deleteShoppingCart:
 *   post:
 *     summary: 删除购物车
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["carId"]
 *             properties:
 *               carId:
 *                 type: string
 *                 default: ""
 *                 description: 购物车id
 *     responses:
 *       200:
 *         description: 成功删除购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 删除购物车成功
 */
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

// 减去购物车内商品的数量
/**
 * @swagger
 * /setMinusShoppingCartCount:
 *   post:
 *     summary: 减去购物车内商品的数量
 *     tags: [Cart]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["changeCartsList"]
 *             properties:
 *               changeCartsList:
 *                 type: array
 *                 default: "已下单完成的商品数组，如：[{goodsId: 1, count: 2},{goodsId: 2, count: 8}] 数组形式每个元素都是一个对象存放已下单完成商品goodsId和数量count"
 *                 description: "已下单完成的商品数组，如：[{goodsId: 1, count: 2},{goodsId: 2, count: 8}] 数组形式每个元素都是一个对象存放已下单完成商品goodsId和数量count"
 *     responses:
 *       200:
 *         description: 成功减去购物车内商品的数量
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 减去购物车内商品的数量成功
 */
router.post("/setMinusShoppingCartCount", async (req, res) => {
  const reqData = req.body;
  const { openId, changeCartsList } = reqData;
  // 获取连接
  const connection = await pool.getConnection().catch((err) => {
    console.log(err);
    throw err;
  });
  // 开始事务 只有connection连接下的原型链才包含beginTransaction pool连接池无法直接调用
  await connection.beginTransaction().catch((err) => {
    console.log(err);
    connection.release();
    throw err;
  });
  try {
    let promiseArr = [];
    changeCartsList.forEach(async (item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        const { goodsId, count } = item;
        // 查询购物车当前商品的数量
        let mysql = `
          SELECT count FROM shopping_cart WHERE openId = '${openId}' AND goodsId = ${goodsId};
        `;
        const dataCount = (await connection.query(mysql))[0][0].count;
        const newCount = dataCount - count;
        // 减去后的数量小于等于0则删除
        if (newCount === 0 || newCount < 0) {
          mysql = `
            DELETE FROM shopping_cart WHERE openId = '${openId}' AND goodsId = ${goodsId};
          `;
        }
        // 修改减去后的数量
        else {
          mysql = `
            UPDATE shopping_cart SET count = ${newCount} WHERE openId = '${openId}' AND goodsId = ${goodsId};
          `;
        }
        await connection.query(mysql);
        console.log(
          "购物车商品：" + item.goodsId + "数量修改成功：" + newCount
        );
        resolve();
      });
      promiseArr.push(promiseItem);
    });
    await Promise.all(promiseArr).then(async () => {
      // 提交事务
      await connection
        .commit()
        .then(() => {
          res.json({
            code: 200,
            msg: "购物车商品数量修改成功",
          });
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err + "购物车商品数量修改失败",
    });
    // 回滚当前的事务
    await connection.rollback();
  } finally {
    // 释放连接 将连接返回到连接池
    await connection.release();
  }
});

module.exports = router;
