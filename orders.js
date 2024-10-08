const router = require("express").Router();
const pool = require("./mysqlInfo");

// 新建订单
router.post("/addOrders", async (req, res) => {
  const reqData = req.body;
  // 需要查询和存入sql的字段
  const ordersDataArr = [
    "openId",
    "address",
    "recipients",
    "phone",
    "province",
    "city",
    "county",
    "full_address",
    "orders_name",
    "orders_phone",
    "deliveryTime",
    "orders_notes",
    "totalPrice",
  ];
  const {
    openId,
    address,
    recipients,
    phone,
    province,
    city,
    county,
    full_address,
    orders_name,
    orders_phone,
    deliveryTime,
    orders_notes,
    goodsList,
  } = reqData;
  let totalPrice = Number(reqData.totalPrice);
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
    // 查询goods商品表是否还有库存 并记录价格和商品信息
    let promiseArr = [];
    let noStockGoods = []; // 库存不足的商品列表
    // 把商品信息goodsInfo存入goodsList变量中 对应每个商品的信息
    goodsList.forEach((item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        let { goodsId, count } = item;
        goodsId = Number(goodsId);
        count = Number(count);
        const mysql = `
          SELECT * FROM goods WHERE goodsId = ${goodsId}
        `;
        await pool.query(mysql).then((data) => {
          // 防止\r转义字符导致mysql报错的问题
          for (let key in data[0][0]) {
            let resData = JSON.stringify(data[0][0][key]);
            if (resData.includes("\\r")) {
              resData = resData.replace(/\\r/g, "");
              data[0][0][key] = JSON.parse(resData);
            }
          }
          item.goodsInfo = data[0][0];
        });
        // 如果库存足够则减少库存
        if (item.goodsInfo.stock >= count) {
          const newStock = item.goodsInfo.stock - count;
          // 减少库存
          let mysql = `
              UPDATE goods SET stock = ${newStock} WHERE goodsId = ${goodsId}
          `;
          await pool.query(mysql).then((data) => {
            console.log(`减少商品id：${goodsId} 库存成功，数量：${newStock}`);
          });
          item.goodsInfo.stock = newStock;
          resolve();
        }
        // 库存不足则回滚事务回到事务开始状态
        else {
          console.log(`商品id：${goodsId}库存不足`);
          noStockGoods.push(goodsId);
          await connection.rollback();
          reject(`商品id：${goodsId}库存不足`);
        }
      });
      promiseArr.push(promiseItem);
    });
    await Promise.all(promiseArr);
    // 创建订单 插入orders表
    // orders_status 订单状态 0.已经创建 1.已支付 2.商家确定 3.已经发货 4.已收货 5.交易完成
    let orders_status = 1;
    let mysql = `
          INSERT INTO orders (${ordersDataArr.toString()}, orders_status) VALUES (${ordersDataArr
      .map(() => "?")
      .toString()}, ${orders_status})
      `;
    // mysql2库 执行非查询语句（如 INSERT, UPDATE, DELETE 等）时返回的对象 ResultSetHeader
    const ResultSetHeader = await pool.query(mysql, [
      openId,
      address,
      recipients,
      phone,
      province,
      city,
      county,
      full_address,
      orders_name,
      orders_phone,
      deliveryTime,
      orders_notes,
      totalPrice,
    ]);
    // insertId：表示最后插入的自增 ID。如果你在插入新记录时使用了自增主键，这个字段会返回新记录的主键值。如果插入多条记录，insertId 通常是最后一条记录的主键值。
    const ordersId = ResultSetHeader[0].insertId;
    // 根据订单的ordersId和createTime更新订单编号
    mysql = `
          SELECT createTime FROM orders WHERE ordersId = ${ordersId}
      `;
    const ordersCreateTime = (await pool.query(mysql))[0][0].createTime;
    // padStart 方法用于在字符串的开始处填充指定的字符，直到达到指定的长度。
    const orders_number =
      ordersCreateTime.getTime() + String(ordersId).padStart(5, "0");
    mysql = `
          UPDATE orders SET orders_number = '${orders_number}' WHERE ordersId = ${ordersId}
      `;
    await pool.query(mysql).then((data) => {
      console.log("更新订单编号成功");
    });
    // 根据goodsList插入orders_item子项表格 记录订单中的所有商品信息
    promiseArr = [];
    goodsList.forEach(async (item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        let { goodsId, count, goodsInfo } = item;
        goodsId = Number(goodsId);
        count = Number(count);
        mysql = `INSERT INTO orders_item (ordersId, goodsId, count, price, goodsInfo) VALUES (${ordersId}, ${goodsId}, ${count}, ${
          goodsInfo.discounted_price
        }, '${JSON.stringify(goodsInfo)}')`;
        await pool.query(mysql).then((res) => {
          console.log("更新orders_item子项成功");
          resolve();
        });
      });
      promiseArr.push(promiseItem);
    });
    await Promise.all(promiseArr);
    res.send({
      code: 200,
      msg: "创建订单成功",
    });
  } catch (err) {
    console.log(err);
    // 回滚当前的事务
    await connection.rollback();
  } finally {
    // 释放连接 将连接返回到连接池
    await connection.release();
  }
});

// 获取订单
router.get("/getOrders", async (req, res) => {
  const { openId } = req.query;
  let { status, pageSize, pageNum } = req.query;
  pageSize = Number(pageSize) || 10;
  pageNum = Number(pageNum) || 1;
  // OFFSET计算公式 = (页码 - 1) * 每页显示的记录数
  const offset = Number(pageNum - 1) * pageSize || 0;
  let mysqlTotal = `
    SELECT COUNT(*) AS total FROM orders WHERE openId = '${openId}'
  `;
  let mysql = `
    SELECT * FROM orders WHERE openId = '${openId}'
  `;
  const orderAndLimit = ` ORDER BY createTime DESC LIMIT ${pageSize} OFFSET ${offset}`;
  let whereAnd = "";
  // 如果有传状态则按状态查询
  if (status) {
    status = status? Number(status) : 0;
    // orders_status 订单状态 0.已经创建 1.已支付 2.商家确定 3.已经发货 4.已收货 5.交易完成
    if (status == 3) {
      whereAnd = ` AND (orders_status = 3 OR orders_status = 2 OR orders_status = 1)`;
    } else if (status == 5) {
      whereAnd = ` AND (orders_status = 5 OR orders_status = 4)`;
    } else {
      whereAnd = ` AND orders_status = ${status}`;
    }
  }
  mysqlTotal += whereAnd;
  mysql += whereAnd + orderAndLimit;
  const total = (await pool.query(mysqlTotal))[0][0].total;
  await pool.query(mysql).then(async (data) => {
    let resData = data[0];
    const promiseArr = [];
    resData.forEach((item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        let mysql = `
          SELECT * FROM orders_item WHERE ordersId = ${item.ordersId}
        `;
        await pool.query(mysql).then((data) => {
          item.goodsList = data[0];
        });
        resolve();
      });
      promiseArr.push(promiseItem);
    });
    await Promise.all(promiseArr);
    res.send({
      code: 200,
      msg: "查询订单表和订单子表成功",
      data: resData,
      total,
    });
  });
});

// 获取订单详情
router.get("/getOrdersDetail", async (req, res) => {
  const { ordersId } = req.query;
  let mysql = `
    SELECT * FROM orders WHERE ordersId = ${ordersId}
  `;
  await pool.query(mysql).then(async (data) => {
    let resData = data[0][0];
    let mysql = `
    SELECT * FROM orders_item WHERE ordersId = ${resData.ordersId}
  `;
    await pool.query(mysql).then((data) => {
      resData.goodsList = data[0];
    });
    res.send({
      code: 200,
      msg: "查询订单详情成功",
      data: resData,
    });
  });
});

// 查询不同状态的订单总数
router.get("/getOrdersTotal", async (req, res) => {
  const { openId } = req.query;
  let { status } = req.query;
  let mysql = `
    SELECT COUNT(*) AS total FROM orders WHERE openId = '${openId}'
  `;
  let whereAnd = "";
  // 如果有传状态则按状态查询
  if (status) {
    status = status? Number(status) : 0;
    // orders_status 订单状态 0.已经创建 1.已支付 2.商家确定 3.已经发货 4.已收货 5.交易完成
    if (status == 3) {
      whereAnd = ` AND (orders_status = 3 OR orders_status = 2 OR orders_status = 1)`;
    } else if (status == 5) {
      whereAnd = ` AND (orders_status = 5 OR orders_status = 4)`;
    } else {
      whereAnd = ` AND orders_status = ${status}`;
    }
  }
  mysql += whereAnd;
  await pool.query(mysql).then((data) => {
    res.send({
      code: 200,
      msg: "查询订单总数成功",
      data: data[0][0].total,
    });
  });
});
module.exports = router;
