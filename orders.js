const router = require("express").Router();
const pool = require("./mysqlInfo");

// 新建订单
router.post("/addOrders", async (req, res) => {
  const reqData = req.body;
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
  // 查询goods商品表是否还有库存 并记录价格和商品信息
  let promiseArr = [];
  let noStockGoods = []; // 库存不足的商品列表
  // 事务是一组 SQL 语句，它们被视为一个单一的工作单元，要么全部成功执行，要么全部不执行。
  // START TRANSACTION 用于开始事务
  // await pool.query("START TRANSACTION");
  // 把商品信息存入goodsList变量中 对应每个商品的信息
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
        item.goodsInfo.stock = newStock;
        // 减少库存
        let mysql = `
            UPDATE goods SET stock = ${newStock} WHERE goodsId = ${goodsId}
        `;
        await pool.query(mysql).then((data) => {
          console.log(`减少商品id：${goodsId} 库存成功，数量：${newStock}`);
        });
        resolve();
      }
      // 库存不足则回滚事务回到事务开始状态
      else {
        console.log(`商品id：${goodsId}库存不足`);
        noStockGoods.push(goodsId);
        // 如果在事务执行过程中发生错误，可以使用 ROLLBACK 命令撤销所有未提交的更改，恢复到事务开始前的状态。
        // 回滚事务
        // await pool.query("ROLLBACK");
        reject();
      }
    });
    promiseArr.push(promiseItem);
  });
  Promise.all(promiseArr).then(async (resResolve) => {
    // 创建订单 插入orders表
    // orders_status 订单状态 0.已经创建 1.已支付 2.商家确定 3.已经发货 4.已收货 5.交易完成
    let mysql = `
        INSERT INTO orders (${ordersDataArr.toString()}, orders_status) VALUES (${ordersDataArr
      .map((item) => "?")
      .toString()}, 1)
    `;
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
    // mysql2库 执行非查询语句（如 INSERT, UPDATE, DELETE 等）时返回的对象 ResultSetHeader
    // insertId：表示最后插入的自增 ID。如果你在插入新记录时使用了自增主键，这个字段会返回新记录的主键值。如果插入多条记录，insertId 通常是最后一条记录的主键值。
    const ordersId = ResultSetHeader[0].insertId;

    // 根据订单的ordersId和createTime更新订单编号
    mysql = `
        SELECT createTime FROM orders WHERE ordersId = ${ordersId}
    `;
    const ordersData = await pool.query(mysql);
    // padStart 方法用于在字符串的开始处填充指定的字符，直到达到指定的长度。
    const orders_number =
      ordersData[0][0].createTime.getTime() + String(ordersId).padStart(5, "0");
    mysql = `
        UPDATE orders SET orders_number = '${orders_number}' WHERE ordersId = ${ordersId}
    `;
    await pool.query(mysql).then((data) => {
      console.log("更新订单编号成功");
    });

    // 根据goodsList插入orders_item子项表格 记录订单中的所有商品信息
    let promiseArr = [];
    goodsList.forEach(async (item) => {
      const promiseItem = new Promise(async (resolve, reject) => {
        let { goodsId, count, goodsInfo } = item;
        goodsId = Number(goodsId);
        count = Number(count);
        mysql = `INSERT INTO orders_item (ordersId, goodsId, count, price, goodsInfo) VALUES (${ordersId}, ${goodsId}, ${count}, ${
          goodsInfo.discounted_price
        }, '${JSON.stringify(goodsInfo)}')`;
        await pool
          .query(mysql)
          .then((res) => {
            console.log("更新orders_item子项成功");
            resolve();
          })
          .catch(async (err) => {
            console.log(err);
            // await pool.query("ROLLBACK");
            reject();
          });
      });
      promiseArr.push(promiseItem);
    });
    await Promise.all(promiseArr);
    // COMMIT 用于提交当前事务。标志着当前事务的结束，并开始一个新的事务。
    // 提交事务
    // await pool
    //   .query("COMMIT")
    //   .then(() => {
    //     console.log("提交事务成功");
    //   })
    //   .catch((err) => {
    //     console.log("提交事务失败");
    //   });
    res.send({
      code: 200,
      msg: "创建订单成功",
    });
  });
});

// 获取订单
router.get("/getOrders", async (req, res) => {
  const { openId } = req.query;
  let mysql = `
    SELECT * FROM orders WHERE openId = '${openId}' ORDER BY createTime DESC
  `;
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
module.exports = router;
