# TZOF 花城微信小程序后端-Node

[![GitHub license](https://img.shields.io/github/license/tzof/flowerShop-node.svg)](https://github.com/tzof/flowerShop-node/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/tzof/flowerShop-node.svg)](https://github.com/tzof/flowerShop-node/issues)
[![GitHub stars](https://img.shields.io/github/stars/tzof/flowerShop-node.svg)](https://github.com/tzof/flowerShop-node/stargazers)

## 项目简介

TZOF 花城微信小程序后端是为[花城微信小程序](https://github.com/tzof/flowerShop-wechartMiniProgram)提供数据支持和服务的核心部分。本项目使用 Node.js + Express 框架开发，数据库采用 MySQL，并通过 Swagger 提供了详细的 API 文档。此外，还集成了阿里云 OSS 服务来处理文件上传。

### 前端仓库 微信小程序
[TZOF花城微信小程序仓库](https://github.com/tzof/flowerShop-wechartMiniProgram)


## API 接口文档

[TZOF 花城小程序接口 api 文档](https://tzof.net:217/api-docs/)

## 功能概览

### 地址管理

- **获取默认地址** - `GET /getDefaultAddress`
- **获取地址列表** - `GET /getAddress`
- **新增地址** - `POST /addAddress`
- **修改地址** - `POST /setAddress`
- **设置默认地址** - `POST /setDefaultAddress`
- **删除地址** - `POST /deleteAddress`

### 层级分类

- **获取层级分类** - `GET /category`

### 商品与详情

- **获取商品列表** - `GET /goods`
- **获取商品详情信息** - `GET /goodsDetail`

### 首页信息

- **获取首页轮播图** - `GET /home/carousel`
- **获取首页活动** - `GET /home/activity`

### 用户登录

- **微信小程序登录获取 token** - `POST /login`

### 订单处理

- **新建订单** - `POST /addOrders`
- **获取订单列表** - `GET /getOrders`
- **获取订单详情** - `GET /getOrdersDetail`
- **查询订单总数** - `GET /getOrdersTotal`

### 文件上传

- **上传文件到 OSS 并返回可访问地址和文件名** - `POST /upload`

### 购物车管理

- **查询购物车总数** - `GET /getShoppingCartTotal`
- **获取购物车列表** - `GET /getShoppingCart`
- **修改购物车选择状态** - `POST /setShoppingCartSelect`
- **全选修改购物车选择状态** - `POST /setShoppingCartAllSelect`
- **添加/修改购物车** - `POST /setShoppingCart`
- **删除购物车条目** - `POST /deleteShoppingCart`
- **减去购物车内商品的数量** - `POST /setMinusShoppingCartCount`

### 用户信息

- **获取用户信息** - `GET /getUserinfo`
- **设置用户信息** - `POST /setUserinfo`

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/tzof/flowerShop-node.git
cd flowerShop-node
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env`文件。根据您的实际部署情况，修改 `.env` 文件并填写相应的配置信息。

```bash
HTTP_PORT=80 // http服务端口
HTTPS_STATUS=true // 是否开启https
HTTPS_PORT=443 // https服务端口
HTTPS_KEY_PATH=xxx/cert/tzof.net.key // https秘钥路径
HTTPS_CERT_PATH=xxx/cert/tzof.net.pem // https证书路径

SWAGGER_HOST=https://tzof.net:217 // swagger api地址
SWAGGER_API_PATH=/api-docs // swagger api路径

JWT_STATUS=true // 是否开启jwt认证
JWT_EXPIRE_TIME=3600 // jwt token过期时间
JWT_SECRET_KEY=jwtkey // jwt加密的密钥

MYSQL_HOST=localhost // mysql地址
MYSQL_USER=root // mysql用户名
MYSQL_PASSWORD=pasdword // mysql密码
MYSQL_DATABASE=flowershop // mysql数据库名
MYSQL_PORT=3306 // mysql端口

WECHARTPROGRAM_APPID=appId // 微信小程序的AppID
WECHARTPROGRAM_SECRET=secret // 微信小程序的AppSecret

OSS_REGION=oss-cn-hangzhou // 阿里云oss区域
OSS_ACCESS_KEY_ID=accessKeyId // 阿里云oss的accessKeyId
OSS_ACCESS_KEY_SECRET=accessKeySecret // 阿里云oss的accessKeySecret
OSS_BUCKET=oss // 阿里云oss的bucket名称
OSS_PATH=flowerShop // 阿里云oss的存储路径(哪个文件夹下)
```

### 4. 启动服务

```bash
node app.js
```

### 5. 访问 api 接口文档及测试接口

通过在`.env`文件中配置好的 swagger 地址`SWAGGER_HOST`和路径`SWAGGER_API_PATH`，即可通过浏览器访问 api 接口文档及测试接口。例如：[https://tzof.net:217/api-docs](https://tzof.net:217/api-docs/)

## 初始化 Mysql 数据库

使用`flowerShop.sql`文件初始化数据库。

## JWT Token认证

所有需要认证的请求都需要在 HTTP 头部包含有效的 Token。可以通过 POST /login 接口获得 Token。<br>
如果需要**关闭JWT认证**则在`.env`文件中将`JWT_STATUS`设置为`false`
