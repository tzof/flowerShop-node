const router = require("express").Router();
const pool = require("./mysqlInfo");

router.get("/goods", async (req, res) => {
  const reqData = req.query;
  // COUNT(*) 会统计表中的所有行，包括那些包含 NULL 值的行。
  // COUNT(column_name) 会统计指定列column_nam中非 NULL 值的行数。
  // AS关键字用于给列或表指定一个别名 把 COUNT(*)指定为 total
  const countQuery = "SELECT COUNT(*) AS total FROM goods";
  await pool.query(countQuery).then(async (totalData) => {
    console.log(totalData[0][0].total);
    // LIMIT 用于指定每页显示的记录数，而 OFFSET 用于指定从哪一条记录开始返回数据。
    // OFFSET计算公式 = (页码 - 1) * 每页显示的记录数
    // 语法一：LIMIT [每页显示的记录数] OFFSET [起始记录的位置];
    // 语法二：LIMIT [起始记录的位置], [每页显示的记录数];
    // ORDER BY 子句用于对查询结果进行排序，ORDER BY id 表示根据 id 列的值对结果进行排序
    // ORDER BY column_name ASC/DESC; column_name指定要排序的列名，ASC：升序排列（默认可不填），DESC：降序排列。
    const dataQuery = `SELECT * FROM goods ORDER BY goodsId LIMIT ? OFFSET ?`;
    const limit = Number(reqData.pageSize) || 10;
    const offset = Number(reqData.pageNum - 1) * limit || 0;
    await pool.query(dataQuery, [limit, offset]).then((data) => {
      res.json({
        code: 200,
        msg: "查询成功",
        data: data[0],
        total: totalData[0][0].total,
      });
    });
  });
});

module.exports = router;
