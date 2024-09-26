const router = require("express").Router();
const pool = require("./mysqlInfo");

router.get("/departments", (req, res) => {
  const reqData = req.query;
  let mysql = `
    WITH RECURSIVE DepartmentHierarchy AS (
      -- 基础情况：选择顶级部门
      SELECT department_id, name, parent_department_id, 0 as level
      FROM departments
      WHERE parent_department_id IS NULL

      UNION ALL

      -- 递归部分：选择子部门
      SELECT d.department_id, d.name, d.parent_department_id, dh.level + 1
      FROM departments d
      INNER JOIN DepartmentHierarchy dh ON d.parent_department_id = dh.department_id
      WHERE dh.level < 2  -- 限制到3层
    )
    SELECT * FROM DepartmentHierarchy;
  `;
  pool.query(mysql).then((data) => {
    let resData = data[0];
    console.log(resData);
    res.json({
      code: 200,
      msg: "获取部门列表成功",
      data: resData,
    });
    // 返回结果
    [
      {
        department_id: 1,
        name: "杭州分部",
        parent_department_id: null,
        level: 0,
      },
      {
        department_id: 2,
        name: "上海分部",
        parent_department_id: null,
        level: 0,
      },
      {
        department_id: 3,
        name: "北京分部",
        parent_department_id: null,
        level: 0,
      },
      {
        department_id: 4,
        name: "杭州萧山分公司",
        parent_department_id: 1,
        level: 1,
      },
      {
        department_id: 5,
        name: "杭州拱墅分公司",
        parent_department_id: 1,
        level: 1,
      },
      {
        department_id: 6,
        name: "杭州滨江分公司",
        parent_department_id: 1,
        level: 1,
      },
      {
        department_id: 7,
        name: "上海浦东分公司",
        parent_department_id: 2,
        level: 1,
      },
      {
        department_id: 8,
        name: "上海静安分公司",
        parent_department_id: 2,
        level: 1,
      },
      {
        department_id: 9,
        name: "北京王府井分公司",
        parent_department_id: 3,
        level: 1,
      },
      {
        department_id: 10,
        name: "杭州顺丰创新中心",
        parent_department_id: 5,
        level: 2,
      },
      {
        department_id: 12,
        name: "上海浦东市局",
        parent_department_id: 7,
        level: 2,
      },
      {
        department_id: 11,
        name: "北京公安厅",
        parent_department_id: 9,
        level: 2,
      },
    ];
    // 效果图
    // http://assets.tzof.net/flower/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240923162934.png
  });
});

module.exports = router;
