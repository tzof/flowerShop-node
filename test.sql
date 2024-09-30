CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `parent_department_id` int DEFAULT NULL,
-- 定义了主键
  PRIMARY KEY (`department_id`),
-- 创建非唯一索引，唯一索引用UNIQUE KEY，KEY后面的是索引名称，()括号里的是索引字段列
  KEY `parent_department_id` (`parent_department_id`),
-- 这一行定义了一个外键约束，可以通过自引用（self-referencing）的方式实现层级关系
-- CONSTRAINT关键字用来命名这个外键约束，这里命名为departments_ibfk_1
-- FOREIGN KEY (parent_department_id)指定了parent_department_id字段列作为外键。
-- REFERENCES departments (department_id)指明了外键引用的是同一个表departments中的department_id列
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 主要功能就是根据层级添加了level层级字段。和返回原有departments表内所有的字段。
-- 这段SQL使用了递归公用表表达式（Recursive Common Table Expression, CTE）来查询部门的层级结构
-- WITH DepartmentHierarchy子句定义了一个临时结果集名字为DepartmentHierarchy，称为CTE。As前面的是cte名，后面的是查询语句
-- RECURSIVE 关键字表示这个CTE是递归的，即它可以在其定义中引用自身。
WITH RECURSIVE DepartmentHierarchy AS (
  -- 基础情况：选择顶级部门
-- 这一部分包含了递归之前DepartmentHierarchy结果集内的所有的数据，所以后面INNER JOIN比较的时候注意是拿左边的表所有数据比DepartmentHierarchy结果集内的数据
-- level 列被初始化为0，表示这是第一层（顶级）。
  SELECT department_id, name, parent_department_id, 0 as level
  FROM departments
  WHERE parent_department_id IS NULL

-- UNION ALL 用于将基础情况的结果与递归部分的结果合并在一起
-- UNION ALL 会保留所有的记录，包括重复的记录。如果希望去除重复记录，可以使用UNION
  UNION ALL

  -- 递归部分：选择子部门
-- 这里从departments表中选择所有子部门，并将它们连接到已经找到的父部门上。
-- d 是departments表的别名。在递归部分的 FROM 子句中，departments 表被赋予了别名 d。
-- dh 是CTE DepartmentHierarchy结果集 的别名。在递归部分的 INNER JOIN 子句中DepartmentHierarchy被赋予了别名 dh。
-- dh.level + 1 表示当前层级比父部门层级高一级。
  SELECT d.department_id, d.name, d.parent_department_id, dh.level + 1
  FROM departments d
-- INNER JOIN 通过parent_department_id和department_id之间的关系，将当前部门与其父部门关联起来。
-- INNER JOIN 会将左表（第一个表 FROM后面的表）中的每一行与右表（第二个表 INNER JOIN后面的表）中的每一行进行比较。
-- 如果关联条件满足（例如两表中指定的列值相等），则这些行会被合并成一行，并包含在结果集中。
-- 如果关联条件不满足，则不会有任何行被包括在结果集中。  
-- 拿左边的表所有数据比DepartmentHierarchy结果集内的数据
  INNER JOIN DepartmentHierarchy dh ON d.parent_department_id = dh.department_id
-- WHERE dh.level < 2 限制递归深度不超过3层
  WHERE dh.level < 2  -- 限制到3层
)
-- 最后，从CTE DepartmentHierarchy 中选择所有列，得到完整的部门层级结构。
SELECT * FROM DepartmentHierarchy;
-- // 效果图 http://assets.tzof.net/flower/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240923162934.png


BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.discount_rate IS NOT NULL THEN
    SET NEW.discounted_price = NEW.original_price * NEW.discount_rate;
  END IF;
END

CREATE DEFINER=`root`@`%` TRIGGER `update_compute_discounted_price` BEFORE UPDATE ON `goods` FOR EACH ROW BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.discount_rate IS NOT NULL THEN
    SET NEW.discounted_price = NEW.original_price * NEW.discount_rate;
  END IF;
END;

CREATE DEFINER=`root`@`%` TRIGGER `insert_compute_discounted_price` BEFORE INSERT ON `goods` FOR EACH ROW BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.discount_rate IS NOT NULL THEN
    SET NEW.discounted_price = NEW.original_price * NEW.discount_rate;
  END IF;
END;


BEGIN
    -- 检查用户是否已经有默认地址
    -- DECLARE声明一个变量来存储用户是否有默认地址的结果。
    DECLARE has_default_address BOOLEAN;
    -- 查询该用户是否已经有默认地址，并将结果存入变量。
    -- SELECT EXISTS 是 SQL 中的一种查询方式，用于检查子查询是否返回任何行。
    -- 如果子查询返回了一行或多行，EXISTS 返回 TRUE。
    -- 如果子查询没有返回任何行，EXISTS 返回 FALSE。
    -- INTO 关键字用于将 EXISTS 查询的结果存储到一个变量中。
    -- 1 只是一个占位符，表示我们不关心具体的列内容，只关心是否存在匹配的行。
    SELECT EXISTS (SELECT 1 FROM address WHERE openId = NEW.openId AND is_default = 1) INTO has_default_address;

    -- 如果没有默认地址，则将新地址设为默认
    IF NOT has_default_address THEN
        SET NEW.is_default = 1;
    END IF;
END

BEGIN
  DECLARE top_categories, sub_categories, random_top, random_sub VARCHAR(255);

  -- GROUP_CONCAT 是 MySQL 中的一个聚合函数，用于将多行数据的某个字段值连接成一个单一的字符串。
  -- (category_id)需要连接的字段
  -- 获取没有parent_category_id的顶级分类ID列表
  SELECT GROUP_CONCAT(category_id)
  FROM category
  WHERE parent_category_id IS NULL
  INTO top_categories;

  -- 获取有parent_category_id的子级分类ID列表
  SELECT GROUP_CONCAT(category_id)
  FROM category
  WHERE parent_category_id IS NOT NULL
  INTO sub_categories;

  -- 从顶级分类中随机选取一个ID
  SET random_top = SUBSTRING_INDEX(SUBSTRING_INDEX(top_categories, ',', FLOOR(1 + (RAND() * (LENGTH(top_categories) - LENGTH(REPLACE(top_categories, ',', ''))) / LENGTH(',')))), ',', -1);

  -- 从子级分类中随机选取一个ID
  SET random_sub = SUBSTRING_INDEX(SUBSTRING_INDEX(sub_categories, ',', FLOOR(1 + (RAND() * (LENGTH(sub_categories) - LENGTH(REPLACE(sub_categories, ',', ''))) / LENGTH(',')))), ',', -1);

  -- CONCAT 函数用于将两个或多个字符串连接成一个单一的字符串。
  -- 将两个随机ID用逗号连接
  SET NEW.category_ids = CONCAT(random_top, ',', random_sub);
END

CREATE DEFINER=`root`@`%` TRIGGER `insert_category_ids` BEFORE INSERT ON `goods` FOR EACH ROW BEGIN
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
END;