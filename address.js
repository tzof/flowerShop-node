const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取默认地址
/**
 * @swagger
 * /getDefaultAddress:
 *   get:
 *     summary: 获取默认地址
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: 成功获取默认地址
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取默认地址成功
 */
router.get("/getDefaultAddress", async (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  let mysql = `
   SELECT * FROM address WHERE openId = '${openId}' AND is_default = 1
  `;
  await pool.query(mysql).then((data) => {
    console.log(data[0][0]);
    res.json({
      code: 200,
      msg: "获取默认地址成功",
      data: data[0][0],
    });
  });
});

// 获取地址列表 默认地址降序返回 DESC升序 ASC降序(默认 可不填)
/**
 * @swagger
 * /getAddress:
 *   get:
 *     summary: 获取地址列表
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: addressId
 *         description: 地址id，不传查当前用户所有地址
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取地址列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   defautl: 获取地址列表成功
 */
router.get("/getAddress", async (req, res) => {
  const reqData = req.query;
  const { openId, addressId } = reqData;
  let mysql = `
   SELECT * FROM address WHERE openId = '${openId}' ${
    addressId ? `AND addressId = ${addressId}` : ""
  } ORDER BY is_default DESC, createTime DESC
  `;
  await pool.query(mysql).then((data) => {
    console.log(data[0]);
    res.json({
      code: 200,
      msg: "获取地址成功",
      data: data[0],
    });
  });
});

// 设置默认地址的时候将用户下其他地址is_default设置为0
async function changeDefault(openId) {
  let mysql = `
    UPDATE address SET is_default = 0 WHERE openId = '${openId}'
  `;
  await pool.query(mysql).then((data) => {
    console.log("设置用户下其他所有地址is_default为0成功", data);
  });
}

// 新增地址
/**
 * @swagger
 * /addAddress:
 *   post:
 *     summary: 新增地址
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["recipients","phone","province","city","county","full_address"]
 *             properties:
 *               recipients:
 *                 type: string
 *                 default: ""
 *                 description: 收件人
 *               phone:
 *                 type: string
 *                 default: ""
 *                 description: 电话号码
 *               province:
 *                 type: string
 *                 default: ""
 *                 description: 省
 *               city:
 *                 type: string
 *                 default: ""
 *                 description: 市
 *               county:
 *                 type: string
 *                 default: ""
 *                 description: 区县
 *               full_address:
 *                 type: string
 *                 default: ""
 *                 description: 详细地址
 *               is_default:
 *                 type: string
 *                 default: ""
 *                 description: 是否为默认地址，1：是，0：不是
 *     responses:
 *       200:
 *         description: 成功新增地址
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 新增地址成功
 */
router.post("/addAddress", async (req, res) => {
  const reqData = req.body;
  const {
    openId,
    recipients,
    phone,
    province,
    city,
    county,
    full_address,
    is_default = 0,
  } = reqData;
  const dataArr = [
    "openId",
    "recipients",
    "phone",
    "province",
    "city",
    "county",
    "full_address",
    "is_default",
  ];
  // 如果设置为默认地址将用户下其他地址is_default设置为0
  if (Number(is_default)) {
    await changeDefault(openId);
  }
  let mysql = `
    INSERT INTO address (${dataArr.toString()})
    VALUES ('${openId}','${recipients}','${phone}','${province}','${city}','${county}','${full_address}',${Number(
    is_default
  )})
  `;
  await pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "新增地址成功",
    });
  });
});

// 修改地址
/**
 * @swagger
 * /setAddress:
 *   post:
 *     summary: 修改地址
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["recipients","phone","province","city","county","full_address"]
 *             properties:
 *               recipients:
 *                 type: string
 *                 default: ""
 *                 description: 收件人
 *               phone:
 *                 type: string
 *                 default: ""
 *                 description: 电话号码
 *               province:
 *                 type: string
 *                 default: ""
 *                 description: 省
 *               city:
 *                 type: string
 *                 default: ""
 *                 description: 市
 *               county:
 *                 type: string
 *                 default: ""
 *                 description: 区县
 *               full_address:
 *                 type: string
 *                 default: ""
 *                 description: 详细地址
 *               is_default:
 *                 type: string
 *                 default: ""
 *                 description: 是否为默认地址，1：是，0：不是
 *     responses:
 *       200:
 *         description: 成功修改地址
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 修改地址成功
 */
router.post("/setAddress", async (req, res) => {
  const reqData = req.body;
  reqData.is_default = Number(reqData.is_default);
  const { openId, addressId, is_default } = reqData;
  const dataArr = [
    "recipients",
    "phone",
    "province",
    "city",
    "county",
    "full_address",
  ];
  // 如果设置为默认地址将用户下其他地址is_default设置为0
  if (is_default) {
    await changeDefault(openId);
  }
  let mysqlStr = "";
  dataArr.forEach((item) => {
    mysqlStr += `${item} = '${reqData[item]}', `;
  });
  let mysql = `
    UPDATE address SET ${mysqlStr} is_default = ${is_default} WHERE addressId = ${addressId}
  `;
  console.log(mysql);

  await pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "修改地址成功",
    });
  });
});

// 修改默认地址选项
/**
 * @swagger
 * /setDefaultAddress:
 *   post:
 *     summary: 修改默认地址选项
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["addressId","is_default"]
 *             properties:
 *               addressId:
 *                 type: string
 *                 default: ""
 *                 description: 地址id
 *               is_default:
 *                 type: string
 *                 default: ""
 *                 description: 是否为默认地址，1：是，0：不是
 *     responses:
 *       200:
 *         description: 成功修改默认地址选项
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 修改默认地址选项成功
 */
router.post("/setDefaultAddress", async (req, res) => {
  const reqData = req.body;
  const { openId, addressId, is_default = 0 } = reqData;
  let mysql = "";
  if (is_default) {
    await changeDefault(openId);
    mysql = `
      UPDATE address SET is_default = 1 WHERE addressId = ${Number(addressId)}
    `;
  } else {
    mysql = `
      UPDATE address SET is_default = 0 WHERE addressId = ${Number(addressId)}
    `;
  }
  await pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "修改默认地址成功",
    });
  });
});

// 删除地址
/**
 * @swagger
 * /deleteAddress:
 *   post:
 *     summary: 删除地址
 *     tags: [Address]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: ["addressId"]
 *             properties:
 *               addressId:
 *                 type: string
 *                 default: ""
 *                 description: 地址id
 *     responses:
 *       200:
 *         description: 成功删除地址
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   default: 删除地址成功
 */
router.post("/deleteAddress", async (req, res) => {
  const reqData = req.body;
  const { addressId } = reqData;
  let mysql = `
    DELETE FROM address WHERE addressId = ${Number(addressId)}
  `;
  await pool.query(mysql).then((data) => {
    console.log(data);
    res.json({
      code: 200,
      msg: "删除地址成功",
    });
  });
});

module.exports = router;
