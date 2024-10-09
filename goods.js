const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取商品列表
/**
 * @swagger
 * /goods:
 *   get:
 *     summary: 获取商品列表
 *     tags: [Goods]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         required: true
 *         description: 第几页
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         required: true
 *         description: 每页多少条数据
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_ids
 *         required: true
 *         description: 分类id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取商品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取商品列表成功
 */
router.get("/goods", async (req, res) => {
  const reqData = req.query;
  const { pageSize, pageNum, category_ids } = reqData;
  console.log(category_ids ? "true" : "false", category_ids);

  // COUNT(*) 会统计表中的所有行，包括那些包含 NULL 值的行。
  // COUNT(column_name) 会统计指定列column_nam中非 NULL 值的行数。
  // AS关键字用于给列或表指定一个别名 把 COUNT(*)指定为 total
  // FIND_IN_SET(变量,查找的字段) 会直接返回该ID在逗号分隔列表中的位置，如果找到则返回一个大于0的整数，否则返回0。在处理逗号分隔的字符串时，会将每个元素视为独立的字符串。
  const countQuery =
    "SELECT COUNT(*) AS total FROM goods" +
    (category_ids
      ? ` WHERE FIND_IN_SET('${category_ids}', category_ids) > 0`
      : "");
  await pool.query(countQuery).then(async (totalData) => {
    console.log(totalData[0][0].total);
    // LIMIT 用于指定每页显示的记录数，而 OFFSET 用于指定从哪一条记录开始返回数据。
    // OFFSET计算公式 = (页码 - 1) * 每页显示的记录数
    // 语法一：LIMIT [每页显示的记录数] OFFSET [起始记录的位置];
    // 语法二：LIMIT [起始记录的位置], [每页显示的记录数];
    // ORDER BY 子句用于对查询结果进行排序，ORDER BY id 表示根据 id 列的值对结果进行排序
    // ORDER BY column_name ASC/DESC; column_name指定要排序的列名，ASC：升序排列（默认可不填），DESC：降序排列。
    const dataQuery =
      `SELECT * FROM goods ` +
      (category_ids
        ? `WHERE FIND_IN_SET('${category_ids}', category_ids) > 0 `
        : "") +
      `ORDER BY goodsId LIMIT ? OFFSET ?`;
    const limit = Number(pageSize) || 10;
    const offset = Number(pageNum - 1) * limit || 0;
    await pool.query(dataQuery, [limit, offset]).then((data) => {
      res.json({
        code: 200,
        msg: "查询商品列表成功",
        data: data[0],
        total: totalData[0][0].total,
      });
    });
  });
});

// 获取商品详情信息
/**
 * @swagger
 * /goodsDetail:
 *   get:
 *     summary: 获取商品详情信息
 *     tags: [Goods]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: goodsId
 *         required: true
 *         description: 商品id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取商品详情信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取商品详情信息成功
 */
router.get("/goodsDetail", async (req, res) => {
  const reqData = req.query;
  const { goodsId } = reqData;
  const dataQuery = "SELECT * FROM goods WHERE goodsId = ?";
  await pool.query(dataQuery, [goodsId]).then((data) => {
    res.json({
      code: 200,
      data: data[0][0],
      msg: "查询商品详情成功",
    });
  });
});

module.exports = router;
