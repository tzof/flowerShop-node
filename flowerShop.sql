/*
 Navicat Premium Dump SQL

 Source Server         : 阿里云ECS
 Source Server Type    : MySQL
 Source Server Version : 80401 (8.4.1)
 Source Host           : 
 Source Schema         : flowershop

 Target Server Type    : MySQL
 Target Server Version : 80401 (8.4.1)
 File Encoding         : 65001

 Date: 08/10/2024 22:17:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for address
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address`  (
  `addressId` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `recipients` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收件人',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电话号码',
  `province` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '省',
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '市',
  `county` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '县',
  `full_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '详细地址',
  `is_default` tinyint NULL DEFAULT 0 COMMENT '是否为默认地址',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`addressId`) USING BTREE,
  INDEX `openId`(`openId` ASC) USING BTREE,
  INDEX `is_default`(`is_default` ASC) USING BTREE,
  INDEX `addressId`(`addressId` ASC) USING BTREE,
  CONSTRAINT `address_openId` FOREIGN KEY (`openId`) REFERENCES `user` (`openId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `parent_category_id` int NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`category_id`) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `parent_category_id`(`parent_category_id` ASC) USING BTREE,
  CONSTRAINT `category_parent_category_id` FOREIGN KEY (`parent_category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1029 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `parent_department_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`department_id`) USING BTREE,
  INDEX `parent_department_id`(`parent_department_id` ASC) USING BTREE,
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for goods
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods`  (
  `goodsId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品名字',
  `stock` int NULL DEFAULT 1000 COMMENT '库存',
  `original_price` decimal(10, 2) NULL DEFAULT 100.00 COMMENT '原价',
  `discount_rate` decimal(10, 2) NULL DEFAULT 1.00 COMMENT '折扣率 % 0.1=10%',
  `discounted_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '折扣后价格，触发器自动计算（插入、更新）',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `floralLanguage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '花语',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `material` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '原料',
  `packing` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '包装',
  `applyUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '适用人群',
  `category_ids` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类id，可以有多个,字符串拼接',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`goodsId`) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  INDEX `category_id`(`category_ids` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1332 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for home_activity
-- ----------------------------
DROP TABLE IF EXISTS `home_activity`;
CREATE TABLE `home_activity`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for home_carousel
-- ----------------------------
DROP TABLE IF EXISTS `home_carousel`;
CREATE TABLE `home_carousel`  (
  `goodsId` int NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`goodsId`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for home_nav
-- ----------------------------
DROP TABLE IF EXISTS `home_nav`;
CREATE TABLE `home_nav`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `ordersId` int NOT NULL AUTO_INCREMENT,
  `orders_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订单编号',
  `openId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址',
  `recipients` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-收件人',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-电话号码',
  `province` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-省',
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-市',
  `county` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-县',
  `full_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货地址-详细地址',
  `orders_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订购人姓名',
  `orders_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订购人手机号',
  `deliveryTime` datetime NULL DEFAULT NULL COMMENT '期望送达时间',
  `orders_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订单备注',
  `totalPrice` decimal(10, 2) NULL DEFAULT NULL COMMENT '总价',
  `orders_status` int NULL DEFAULT NULL COMMENT '订单状态 0.已经创建 1.已支付 2.商家确定 3.已经发货 4.已收货 5.交易完成',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ordersId`) USING BTREE,
  INDEX `openId`(`openId` ASC) USING BTREE,
  INDEX `orderId`(`ordersId` ASC) USING BTREE,
  CONSTRAINT `order_openId` FOREIGN KEY (`openId`) REFERENCES `user` (`openId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 169 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders_item
-- ----------------------------
DROP TABLE IF EXISTS `orders_item`;
CREATE TABLE `orders_item`  (
  `ordersItemId` int NOT NULL AUTO_INCREMENT,
  `ordersId` int NOT NULL,
  `goodsId` int NOT NULL,
  `count` int NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `goodsInfo` json NULL COMMENT '商品信息',
  PRIMARY KEY (`ordersItemId`) USING BTREE,
  INDEX `ordersId`(`ordersId` ASC) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `orders_item_goodsId` FOREIGN KEY (`goodsId`) REFERENCES `goods` (`goodsId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_item_ordersId` FOREIGN KEY (`ordersId`) REFERENCES `orders` (`ordersId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 610 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for shopping_cart
-- ----------------------------
DROP TABLE IF EXISTS `shopping_cart`;
CREATE TABLE `shopping_cart`  (
  `carId` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `goodsId` int NOT NULL,
  `count` int NULL DEFAULT NULL,
  `isSelect` tinyint NULL DEFAULT 0 COMMENT '是否选中',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`carId`) USING BTREE,
  INDEX `openId`(`openId` ASC) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  INDEX `carId`(`carId` ASC) USING BTREE,
  INDEX `test`(`openId` ASC, `goodsId` ASC) USING BTREE,
  CONSTRAINT `shopping_cart_goodsId` FOREIGN KEY (`goodsId`) REFERENCES `goods` (`goodsId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `shopping_cart_openId` FOREIGN KEY (`openId`) REFERENCES `user` (`openId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 211 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `openId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `avatarfileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `avatarUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createIp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `updateIp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`openId`) USING BTREE,
  INDEX `openId`(`openId` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Triggers structure for table goods
-- ----------------------------
DROP TRIGGER IF EXISTS `insert_compute_discounted_price`;
delimiter ;;
CREATE TRIGGER `insert_compute_discounted_price` BEFORE INSERT ON `goods` FOR EACH ROW BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.discount_rate IS NOT NULL THEN
    SET NEW.discounted_price = NEW.original_price * NEW.discount_rate;
  END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table goods
-- ----------------------------
DROP TRIGGER IF EXISTS `insert_category_ids`;
delimiter ;;
CREATE TRIGGER `insert_category_ids` BEFORE INSERT ON `goods` FOR EACH ROW BEGIN
  DECLARE top_categories, sub_categories, random_top, random_sub VARCHAR(255);

  SELECT GROUP_CONCAT(category_id)
  FROM category
  WHERE parent_category_id IS NULL
  INTO top_categories;

  SELECT GROUP_CONCAT(category_id)
  FROM category
  WHERE parent_category_id IS NOT NULL
  INTO sub_categories;

  SET random_top = SUBSTRING_INDEX(SUBSTRING_INDEX(top_categories, ',', FLOOR(1 + (RAND() * (LENGTH(top_categories) - LENGTH(REPLACE(top_categories, ',', ''))) / LENGTH(',')))), ',', -1);

  SET random_sub = SUBSTRING_INDEX(SUBSTRING_INDEX(sub_categories, ',', FLOOR(1 + (RAND() * (LENGTH(sub_categories) - LENGTH(REPLACE(sub_categories, ',', ''))) / LENGTH(',')))), ',', -1);

  SET NEW.category_ids = CONCAT(random_top, ',', random_sub);
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table goods
-- ----------------------------
DROP TRIGGER IF EXISTS `update_compute_discounted_price`;
delimiter ;;
CREATE TRIGGER `update_compute_discounted_price` BEFORE UPDATE ON `goods` FOR EACH ROW BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.discount_rate IS NOT NULL THEN
    SET NEW.discounted_price = NEW.original_price * NEW.discount_rate;
  END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
