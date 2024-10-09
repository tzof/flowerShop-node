const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取层级分类
/**
 * @swagger
 * /category:
 *   get:
 *     summary: 获取层级分类
 *     tags: [Category]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         description: 分类id，不传就返回所有第一层的类别，可以根据第一层类别的id查询对应的子类别。只有两层。
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取层级分类
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取层级分类成功
 */
router.get("/category", async (req, res) => {
  const reqData = req.query;
  const category_id = reqData.id;
  // 不传id就返回所有一层的类别
  if (!category_id) {
    let mysql = `
    SELECT * FROM category WHERE parent_category_id IS NULL;
  `;
    await pool.query(mysql).then((data) => {
      let resData = data[0];
      console.log(reqData.id);
      res.json({
        code: 200,
        msg: "获取大类分类成功",
        data: resData,
      });
    });
  }
  // 传id就返回对应category_id的所有子类
  else {
    let mysql = `
    SELECT * FROM category WHERE parent_category_id = ${category_id};
  `;
    await pool.query(mysql).then((data) => {
      let resData = data[0];
      console.log(reqData.id);
      res.json({
        code: 200,
        msg: "获取分类成功",
        data: resData,
      });
    });
  }
  // 返回所有类别并增加level第几层字段
  if (false) {
    // 这段mysql的注释看test.sql里面
    // 主要功能就是根据层级添加了level层级字段。和返回原有表内所有的字段。
    let mysql = `
    WITH RECURSIVE DepartmentHierarchy AS (
      -- 基础情况：选择顶级部门
      SELECT category_id, parent_category_id, name, url, 0 as level
      FROM category
      WHERE parent_category_id IS NULL

      UNION ALL

      -- 递归部分：选择子部门
      SELECT c.category_id, c.parent_category_id, c.name, c.url, dh.level + 1
      FROM category c
      INNER JOIN DepartmentHierarchy dh ON c.parent_category_id = dh.category_id
      WHERE dh.level < 1  -- 限制到2层
    )
    SELECT * FROM DepartmentHierarchy;
  `;
    await pool.query(mysql).then((data) => {
      let resData = data[0];
      console.log(reqData.id);
      // console.log(resData);
      res.json({
        code: 200,
        msg: "获取小类分层成功",
        data: resData,
      });
    });
  }
});

module.exports = router;
