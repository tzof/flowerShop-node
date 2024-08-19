var router = require("express").Router();

var pool = require("./db.js");
// JWT(Json Web Token)是实现token技术的一种解决方案;
var jwt = require("jsonwebtoken");

// var checktoken = require("./checktoken.js");

// 登录
/*
 *请求方式为：get
 *username
 *password
 *响应内容{code:0,msg:""}用户名或密码错误   {code:1,token:"",username:"",msg:""}成功返回token
 */
// 向数据库发送请求 根据浏览器发送的username和password查询数据库是否存在这个用户
router.get("/logon", (req, res) => {
    console.log("进入了登录接口，正在验证账号密码中");
    pool.query("select * from user where username=? and password=?", [req.query.username, req.query.password], (err, data) => {
        // 验证user数据表中是否有会员账号密码，没有则表示到admin数据表中寻找或者表示账号密码出错
        if (data.length == 0 || err) {
            console.log(err, "用户不是admin管理员或账号密码出错");
            // 验证admin数据表中有无此管理员账号密码，有贼返回特殊的token，没有则表示账号密码出错
            pool.query("select * from admin where username=? and password=?", [req.query.username, req.query.password], (err, data) => {
                if (data.length == 0 || err) {
                    console.log(err, "账号密码出错")
                    // 表示用户不存在
                    console.log('用户名或密码输入错误', err);
                    res.json({
                        code: 0,
                        msg: '登录失败，用户名或密码输入错误'
                    })
                    return;
                }
                var token = jwt.sign({ username: req.query.username }, "admin", {
                    expiresIn: 60 * 60 * 24 * 7
                })
                token += 'blxhtzofadminuser';
                // 表示用户存在 返回token以及登录的用户名
                res.json({
                    code: 1,
                    token: token,
                    username: req.query.username,
                    msg: "登录成功，管理员账户"
                })
            })
        }
        else {
            // 签名，获取token
            // para1:对象;待签名数据
            // para2:字符串；签名使用密钥
            // para3:配置对象；expiresIn，有效期，以秒为单位
            var token = jwt.sign({ username: req.query.username }, "user", {
                expiresIn: 60 * 60 * 24 * 7
            })
            // 表示用户存在 返回token以及登录的用户名
            res.json({
                code: 1,
                token: token,
                username: req.query.username,
                msg: "登录成功，会员账户"
            })
        }
    })
})

// 注册 并加入dkp列表
/*
 *请求方式为：get
 *username
 *password
 *gamename
 *gameid
 *响应内容{code:0,msg:"",username}被占用   {code:1,msg:"",username}成功
 */
router.get("/register", (req, res) => {
    console.log("进入了注册接口，正在验证是否已有此账号");
    // 往user表中插入数据，字段username password 赋值请求的内容
    pool.query("insert into user (username,password,gamename,gameid) values(?,?,?,?)", [req.query.username, req.query.password, req.query.gamename, req.query.gameid], (err, data) => {
        // 数据库错误,可能输入的用户名已经存在或是其他原因 注册失败
        if (err) {
            console.log(err, '数据库错误,可能输入的用户名已经存在或是其他原因');
            res.json({
                code: 0,
                msg: '注册失败，此用户名已存在'
            })
            return;
        }
        // 注册成功
        console.log('注册成功');
        pool.query("insert into dkp (gamename,ls,tjc,jdz,lyz,cjg,yy,other,usedkp) values(?,?,?,?,?,?,?,?,?)", [req.query.gamename, 0, 0, 0, 0, 0, 0, 0, 0], (err, data) => {
            if (err) {
                console.log(err, '加入dkp列表失败，可能是已经存在次用户');
                res.json({
                    code: 0,
                    msg: '加入dkp列表失败，可能是已经存在次用户'
                })
                return;
            }
            res.json({
                code: 1,
                msg: '注册成功并加入DKP列表',
                username: req.query.username
            })
        })

    })
})


// 获取dkp列表
/*
 *请求方式为：get
 *token
 *响应内容{code:0,msg:""}获取dkp列表失败   
 *{code:1,data:{gamename:"",ls:"",tjc:"",jdz:"",lyz:"",cjg:"",yy:"",other:"",usedkp:""},msg:""}成功
 */
router.get("/dkplist", (req, res) => {
    console.log('进入获取dkp列表接口，正在读取数据库');
    pool.query("select gamename,ls,tjc,jdz,lyz,cjg,yy,other,usedkp from dkp", (err, data) => {
        if (err) {
            if ((/blxhtzofadminuser/).test(req.query.token)) {
                res.json({
                    code: 1,
                    data: data,
                    msg: '查询dkp列表成功并返回data'
                })
                return;
            }
            console.log(err, '查询dkp列表出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询dkp列表出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询列表成功');
            res.json({
                code: 1,
                data: data,
                msg: '查询dkp列表成功并返回data'
            })
        }
    })
})

// 获取用户信息
/*
 *请求方式为：get
 *token
 *username
 *响应内容{code:0,msg:""}获取用户信息失败   
 *{code:1,userData:{username:"",gamename:"",gameid:""},dkpdata:{ls,tjc,jdz,lyz,cjg,yy,other,usedkp},msg:""}成功
 */
router.get("/userinformation", (req, res) => {
    console.log('进入获取用户信息接口，正在读取数据库');
    if ((/blxhtzofadminuser/).test(req.query.token)) {
        pool.query("select username,gamename,gameid from admin where username=?", [req.query.username], (err, data) => {
            if (err) {
                console.log(error, '查询用户信息出错，可能是没有token');
                res.json({
                    code: 0,
                    msg: '查询用户信息出错，可能是没有token'
                })
                return;
            }
            else {
                console.log('查询列表成功');
                let userData = data[0]; // 储存数据库返回的用户信息
                let gameName = data[0].gamename;
                console.log(gameName)
                pool.query("select ls,tjc,jdz,lyz,cjg,yy,other,usedkp from dkp where gamename=?", [gameName], (err, data) => {
                    if (err) {
                        console.log(error, '查询用户信息出错，可能是没有token');
                        res.json({
                            code: 0,
                            msg: '查询用户信息出错，可能是没有token'
                        })
                        return;
                    }
                    console.log('通过username返回的游戏名gamename查询DKP成功');
                    res.json({
                        code: 1,
                        userData: userData,
                        dkpData: data[0],
                        msg: '查询用户信息成功并返回data'
                    })
                })
                return;
            }
        })
        return;
    }
    pool.query("select username,gamename,gameid from user where username=?", [req.query.username], (err, data) => {
        if (err) {
            console.log(error, '查询用户信息出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询用户信息出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询列表成功');
            // 通过对应用户username返回的游戏名gamename在dkp数据表中查询对应gamename对应的dkp数据
            let userData = data[0]; // 储存数据库返回的用户信息
            let gameName = data[0].gamename;
            console.log(gameName)
            pool.query("select ls,tjc,jdz,lyz,cjg,yy,other,usedkp from dkp where gamename=?", [gameName], (err, data) => {
                if (err) {
                    console.log(error, '查询用户信息出错，可能是没有token');
                    res.json({
                        code: 0,
                        msg: '查询用户信息出错，可能是没有token'
                    })
                    return;
                }
                console.log('通过username返回的游戏名gamename查询DKP成功');
                res.json({
                    code: 1,
                    userData: userData,
                    dkpData: data[0],
                    msg: '查询用户信息成功并返回data'
                })
            })
        }
    })
})

// 获取dkp列表的玩家名字
/*
 *请求方式为：get
 * data null
 *响应内容{code:0,msg:""}失败   {code:1,gamename:"",msg:""}成功
 */
router.get("/dkpname", (req, res) => {
    console.log('进入获取dkp列表玩家名字接口，正在读取数据库');
    pool.query("select gamename,usedkp from dkp", (err, data) => {
        if (err) {
            console.log(err, '查询dkp列表玩家名字出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询dkp列表玩家名字出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询DKP列表名字成功');
            res.json({
                code: 1,
                gamename: data,
                msg: '查询dkp列表名字成功并返回gamename'
            })
        }
    })
})

// 操作DKP，添加操作记录
/*
 *请求方式为：get
 *type:加分类型
 *number:DKP
 *msg:备注
 *gamenames:加分名单
 *time:当前时间(YY-DD-hh-mm 24小时)
 *响应内容{code:0,msg:""}失败   {code:1,msg:""}成功
 */
router.get("/dkphistory", (req, res) => {
    console.log('进入操作DKP接口，添加DKP记录');
    if (!req.query.type || !req.query.number || !req.query.gamenames) {
        console.log('erro参数为带入完全')
        return;
    }
    pool.query("insert into dkphistory (type,number,msg,names,time) values(?,?,?,?,?)", [req.query.type, req.query.number, req.query.msg, req.query.gamenames, req.query.time], (err, data) => {
        if (err) {
            console.log(err, 'DKP记录失败');
            res.json({
                code: 0,
                msg: 'DKP记录失败'
            })
            return;
        }
        // DKP记录成功
        console.log('DKP记录成功');
        res.json({
            code: 1,
            msg: 'DKP记录成功',
        })
    })
})

// 修改DKP，更改dkp列表的值
/*
 *请求方式为：get
 *type:加分类型
 *number:DKP
 *gamename:加分人员
 *响应内容{code:0,msg:""}失败   {code:1,msg:""}成功
 */
router.get("/setdkp", (req, res) => {
    console.log('进入修改DKP接口，修改dkp列表的值');
    switch (req.query.type) {
        case "联赛": req.query.type = 'ls'; break;
        case "天江城": req.query.type = 'tjc'; break;
        case "据点战": req.query.type = 'jdz'; break;
        case "连云寨": req.query.type = 'lyz'; break;
        case "藏金谷": req.query.type = 'cjg'; break;
        case "频道积分": req.query.type = 'yy'; break;
        case "其他": req.query.type = 'other'; break;

        default: '';
    }
    // 更改DKP
    pool.query(`select ${req.query.type} from dkp where gamename = ?`, [req.query.gamename], (err, data) => {
        if (err) {
            console.log(err, '查询DKP出错');
            res.json({
                code: 0,
                msg: '查询DKP出错'
            })
            return;
        }
        let number = parseInt(data[0][req.query.type]);
        console.log('DKP查询完成', number);
        number += parseInt(req.query.number);
        pool.query(`update dkp set ${req.query.type} = ? where gamename = ?`, [number, req.query.gamename], (err, data) => {
            if (err) {
                console.log(err, '更改DKP出错');
                res.json({
                    code: 0,
                    msg: '更改DKP出错',
                    data: number
                })
                return;
            }
            // 更改DKP成功
            console.log('更改DKP成功');
            res.json({
                code: 1,
                msg: '更改DKP成功',
                data: number
            })
        })
    })
})

// 渲染奖励列表
/*
 *请求方式为：get
 *data null
 *响应内容{code:0,msg:""}失败   {code:1,msg:""}成功
 */
router.get("/exchangeview", (req, res) => {
    console.log('进入渲染奖励列表接口');
    // 更改DKP列表usedkp的值
    pool.query("select exchangename,img,price,number from exchange", (err, data) => {
        if (err) {
            console.log(err, '查询奖励列表出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询奖励列表出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询奖励列表成功');
            res.json({
                code: 1,
                data: data,
                msg: '查询奖励列表成功返回data'
            })
        }
    })
})

// 更改奖励仓库列表剩余个数
/*
 *请求方式为：get
 *name:奖励名字
 *number:兑换个数
 *响应内容{code:0,msg:""}失败   {code:1,msg:""}成功
 */
router.get("/exchange", (req, res) => {
    console.log('进入了更改仓库库存接口');
    if (!req.query.name || !req.query.number) {
        console.log('erro参数未带入完全')
        return;
    }
    // 查询奖励仓库列表并更改库存number
    pool.query("select number from exchange where exchangename = ?", [req.query.name], (err, data) => {
        if (err) {
            console.log(err, '查询奖励仓库出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询奖励仓库出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询奖励仓库成功');
            // 更改exchange列表number的值
            let number = data[0].number;
            number = parseInt(number) - parseInt(req.query.number);
            pool.query(`update exchange set number = ? where exchangename = ?`, [number, req.query.name], (err, data) => {
                if (err) {
                    console.log(err, '更改奖励库存出错');
                    res.json({
                        code: 0,
                        msg: '更改奖励库存出错',
                    })
                    return;
                }
                // 更改库存成功
                console.log('更改奖励库存成功');
                res.json({
                    code: 1,
                    msg: '更改奖励库存成功',
                })
            })
        }
    })
})

// 更改使用DKP并记录
/*
 *请求方式为：get
 *gamename:兑换用户
 *msg: 兑换商品列表
 *all: 兑换总消耗DKP
 *time:当前时间(YY-DD-hh-mm 24小时)
 *响应内容{code:0,msg:""}失败   {code:1,msg:""}成功
 */
router.get("/exchangeDkp", (req, res) => {
    console.log('进入了更改DKP并记录的接口exchangeDkp')
    // 查询DKP列表并改变用户使用DKP的数据usedkp
    pool.query("select usedkp from dkp where gamename = ?", [req.query.gamename], (err, data) => {
        if (err) {
            console.log(err, '查询DKP列表出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询DKP列表出错，可能是没有token'
            })
            return;
        }
        console.log('查询DKP列表成功')
        // 更改用户使用DKP
        let useDkp = data[0].usedkp;
        let use = parseInt(req.query.all)
        let useAll = useDkp - use;
        pool.query(`update dkp set usedkp = ? where gamename = ?`, [useAll, req.query.gamename], (err, data) => {
            if (err) {
                console.log(err, '更改用户使用DKP出错');
                res.json({
                    code: 0,
                    msg: '更改用户使用DKP出错',
                })
                return;
            }
            // 更改用户使用DKP成功
            console.log('更改用户使用DKP成功');
            // 添加DKP记录
            pool.query("insert into dkphistory (type,number,msg,names,time) values(?,?,?,?,?)", ['dkp商品兑换', useAll, req.query.msg, req.query.gamename, req.query.time], (err, data) => {
                if (err) {
                    console.log(err, 'DKP记录失败');
                    res.json({
                        code: 0,
                        msg: 'DKP记录失败'
                    })
                    return;
                }
                // 添加DKP记录成功
                console.log('DKP记录成功');
                res.json({
                    code: 1,
                    msg: '更改用户使用DKP成功，并添加DKP记录',
                })
            })
        })
    })
})


// 查询DKP记录，或查询个人dkp记录
/*
 *请求方式为：get
 *gamename 游戏名 (只有查询个人DKP记录是带入)
 */
router.get("/getDkpHistory", (req, res) => {
    console.log('进入了查询DKP接口getDkpHistory')
    pool.query("select * from dkphistory", (err, data) => {
        if (err) {
            console.log(err, '查询DKP记录出错，可能是没有token');
            res.json({
                code: 0,
                msg: '查询DKP记录出错，可能是没有token'
            })
            return;
        }
        else {
            console.log('查询所有DKP记录成功')
            if (!req.query.gamename) {
                res.json({
                    code: 1,
                    data: data,
                    msg: '查询所有DKP记录成功',
                })
                return;
            }
            else {
                console.log('进入了查询个人DKP判断')
                let arr = JSON.stringify(data).split(',')
                arr = JSON.parse(arr);
                let flagIndex = [];
                Array.from(arr).forEach((item, index) => {
                    item.names = JSON.stringify(item.names).split("','")
                    item.names.forEach((item) => {
                        item = item.replace(/[\'\"\“]/, '');
                        item = item.replace(/[\'\"\“]/, '');
                        let reg = new RegExp(req.query.gamename)
                        if (reg.test(item)) {
                            flagIndex.push(index)
                        }
                    })
                })
                let list = [];
                Array.from(flagIndex).forEach((item) => {
                    list.push(data[item])
                })
                if (list.length == 0) {
                    res.json({
                        code: 0,
                        msg: '本用户没有DKP记录，查询DKP记录出错'
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: list,
                    msg: '查询个人DKP记录成功',
                })
            }
        }
    })
})


// 返回个人中心中数据
/*
 *请求方式为：get
 *username 用户名
 */
router.get("/personal", (req, res) => {
    console.log('进入了获取个人中心接口personal')
    if ((/blxhtzofadminuser/).test(req.query.token)) {
        pool.query("select username,gamename,gameid from admin where username=?", [req.query.username], (err, data) => {
            if (err || data.length == 0) {
                console.log(err, '查询用户信息出错，可能是没有token或者用户名出错');
                res.json({
                    code: 0,
                    msg: '查询用户信息出错，可能是没有token或者用户名出错'
                })
                return;
            }
            else {
                console.log('查询列表成功');
                let userData = data[0]; // 储存数据库返回的用户信息
                res.json({
                    code: 1,
                    data: userData,
                    msg: '查询用户信息成功并返回data'
                })
                return;
            }
        })
        return;
    }
    else {
        pool.query("select username,gamename,gameid from user where username=?", [req.query.username], (err, data) => {
            if (err || data.length == 0) {
                console.log(err, '查询用户信息出错，可能是没有token或者用户名出错');
                res.json({
                    code: 0,
                    msg: '查询用户信息出错，可能是没有token或者用户名出错'
                })
                return;
            }
            else {
                console.log('查询列表成功');
                let userData = data[0]; // 储存数据库返回的用户信息
                res.json({
                    code: 1,
                    data: userData,
                    msg: '查询用户信息成功并返回data'
                })
                return;
            }
        })
    }
})

// 获取个人dkp列表
/*
 *请求方式为：get
 *token
 *gamename
 *响应内容{code:0,msg:""}获取dkp列表失败   
 *{code:1,data:{gamename:"",ls:"",tjc:"",jdz:"",lyz:"",cjg:"",yy:"",other:"",usedkp:""},msg:""}成功
 */
router.get("/nameDkplist", (req, res) => {
    console.log('进入获取个人dkp列表接口，正在读取数据库');
    pool.query("select * from dkp where gamename = ?", [req.query.gamename], (err, data) => {
        if (err) {
            if ((/blxhtzofadminuser/).test(req.query.token) || data.length != 0) {
                res.json({
                    code: 1,
                    data: data,
                    msg: '查询个人dkp列表成功并返回data'
                })
                return;
            }
            console.log(err, '查询个人dkp列表出错，可能是没有token或者游戏名出错');
            res.json({
                code: 0,
                msg: '查询个人dkp列表出错，可能是没有token或者游戏名出错'
            })
            return;
        }
        else {
            if (data.length != 0) {
                console.log('查询个人dkp列表成功');
                res.json({
                    code: 1,
                    data: data,
                    msg: '查询个人dkp列表成功并返回data'
                })
            }
            else {
                console.log('查询个人dkp列表出错，可能是没有token或者游戏名出错');
                res.json({
                    code: 0,
                    msg: '查询个人dkp列表出错，可能是没有token或者游戏名出错'
                })
            }
        }
    })
})

// 更改奖励价格和库存
/*
 *请求方式为：get
 *name 奖励名字
 *price 奖励价格
 *number 奖励库存
 */
router.get("/setExchange", (req, res) => {
    console.log('进入了更改价格和库存接口personal')
    pool.query(`update exchange set price = ?, number = ? where exchangename = ?`, [req.query.price, req.query.number, req.query.name], (err, data) => {
        if (err) {
            console.log(err, '更改价格和库存出错，可能是没有管理权限');
            res.json({
                code: 0,
                msg: '更改价格和库存出错，可能是没有管理权限'
            })
            return;
        }
        console.log('更改价格和库存成功');
        res.json({
            code: 1,
            msg: '更改价格和库存成功'
        })
    })
})

module.exports = router;