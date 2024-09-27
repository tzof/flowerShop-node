const router = require("express").Router();
const pool = require("./mysqlInfo");

// 获取地址 默认地址降序返回 DESC升序 ASC降序(默认 可不填)
router.get("/getAddress", async (req, res) => {
  const reqData = req.query;
  const { openId } = reqData;
  let mysql = `
   SELECT * FROM address WHERE openId = '${openId}' ORDER BY is_default DESC
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

async function changeDefault(openId) {
  let mysql = `
    UPDATE address SET is_default = 0 WHERE openId = '${openId}'
  `;
  await pool.query(mysql).then((data) => {
    console.log("设置用户下其他所有地址is_default为0成功", data);
  });
}

// 新增地址
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
module.exports = router;
