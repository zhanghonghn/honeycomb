#
#  数据库初始化
#
#

-- 
-- 创建数据库tanz
-- 
-- CREATE DATABASE `tanz`;


-- 
-- 论坛信息
-- 
-- 一些备选：
--  水木， 焦点房地产网，55bbs
--
DROP TABLE IF EXISTS `tz_forum`;
CREATE TABLE `tz_forum` (
    `id` TINYINT AUTO_INCREMENT PRIMARY KEY,
    `url` VARCHAR(256) COMMENT '论坛首页URL',
    `name` VARCHAR(64) COMMENT '论坛中文名称',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常使用, 2-已删除，停用',
    `created_at` DATETIME COMMENT '添加时间'
)  ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 种子版面
-- 
DROP TABLE IF EXISTS `tz_forum_board`;
CREATE TABLE `tz_forum_board` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `url` VARCHAR(256) COMMENT '版面首页URL',
    `name` VARCHAR(64) COMMENT '版面中文名称',
    `forum_id` TINYINT COMMENT '所属论坛id',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常使用, 2-已删除，停用',
    `created_at` DATETIME COMMENT '添加时间'
)  ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 客户基本信息
-- 
DROP TABLE IF EXISTS `tz_client`;
CREATE TABLE `tz_client` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `login_name` VARCHAR(64) NOT NULL COMMENT '登陆时所用的帐号名称',
    `password` VARCHAR(64) COMMENT '登陆密码，保存salt + 个人信息合并加密后的字符串',
    `nick_name` VARCHAR(64) COMMENT '昵称，登陆后显示用',
    `company_name` VARCHAR(128) COMMENT '公司名称',
    `mobile_number` VARCHAR(16) COMMENT '联系用手机号码',
    `email` VARCHAR(32) COMMENT '邮箱地址',
    `office_address` VARCHAR(128) COMMENT '办公地址，或者联系地址',
    `status` TINYINT COMMENT '状态',
    `description` VARCHAR(128) COMMENT '备注信息',
    `created_at` DATETIME COMMENT '注册时间',
    `last_login_at` DATETIME COMMENT '最近一次登陆时间'        
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- 
-- 论坛帐号
-- 自动操作所需的用于登陆论坛的帐号
-- 每个客户一个帐号？？好麻烦。。。
-- 
DROP TABLE IF EXISTS `tz_forum_account`;
CREATE TABLE `tz_forum_account` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `login_name` VARCHAR(64) NOT NULL COMMENT '登陆时所用的帐号名称',
    `password` VARCHAR(64) COMMENT '登陆密码，保存明文？？',
    `cookie_file_path` VARCHAR(64) COMMENT 'cookie数据保存路径',
    `forum_id` TINYINT COMMENT '所属论坛的ID',
    `client_id` INT COMMENT '被分配使用该帐号的客户ID',
    `status` TINYINT DEFAULT 0 COMMENT '状态, 1-正常可用，2-问题A, 3-问题B',
    `description` VARCHAR(128) COMMENT '备注信息',
    `last_login_at` DATETIME COMMENT '上次登陆时间，用于养帐号，避免长时间无登陆被注销。。。',
    `created_at` DATETIME COMMENT '注册时间'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 帖子模版
-- 从属于某个客户的、回帖时使用的文字模版
-- 
DROP TABLE IF EXISTS `tz_post_template`;
CREATE TABLE `tz_post_template` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_id` INT COMMENT '所属客户Id',
    `content` VARCHAR(512) COMMENT '模版内容',
    `created_at` DATETIME COMMENT '添加时间',
    `updated_at` DATETIME COMMENT '更新时间'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- 
-- 版面HTML解析模版
-- 
DROP TABLE IF EXISTS `tz_parse_template`;
CREATE TABLE `tz_parse_template` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `board_id` INT COMMENT '所属的版面Id',
    `type_id` TINYINT COMMENT '模版类型，即对应于提取何种数据，1-下一页URL，2-列表页帖子URL, 3-同主题页主贴内容， 4-同主题页主贴作者ID, etc.',
    `base_path` VARCHAR(128) COMMENT '起始节点，后面的selector都是从该节点开始适用',
    `selector` VARCHAR(128) COMMENT '从base_path节点开始，使用该selector可以定位到目标数据节点',
    `abstract_method` VARCHAR(32) COMMENT '最后的目标节点，其中的数据该使用哪种方法提取到，方法来源与所使用的解析类',
    `description` VARCHAR(128) COMMENT '备注信息',
    `created_at` DATETIME COMMENT '添加时间',
    `updated_at` DATETIME COMMENT '更新时间'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 抓取任务
-- 
DROP TABLE IF EXISTS `tz_crawl_task`;
CREATE TABLE `tz_crawl_task` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `board_id` INT COMMENT '所属的版面Id',
    `page_type` TINYINT COMMENT '页面类型，主题列表页(1)，还是同主题内容页(2)',
    `page_url` VARCHAR(256) COMMENT '被抓页面的URL',
    `crawl_time` DATETIME COMMENT '抓取时间',
    `crawl_status` TINYINT COMMENT '抓取状态，抓取中-1，已完成-2，失败-3',
    `parse_status` TINYINT COMMENT '0-尚未进行， 1-解析成功，2-解析失败，3-解析成功但结果数据异常',
    `crawled_file_path` VARCHAR(32) COMMENT '抓取到的页面保存的位置，主要用于问题追查和模版改进',

    `proxy_ip` VARCHAR(16) COMMENT '所用代理的出口IP，保留字段',
    `response_status` VARCHAR(16) COMMENT '服务器端响应状态码，用于处理未来的可能的被屏蔽的情况'    
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 抓取结果: 匹配目标特征的情况
-- 
-- 该表是否应该合入抓取任务表中？？？
-- 
DROP TABLE IF EXISTS `tz_crawl_result`;
CREATE TABLE `tz_crawl_result` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `task_id` INT COMMENT '抓取任务ID',
    `matched_rule_id` SMALLINT COMMENT '与哪条规则相匹配',
    `post_url` VARCHAR(256) COMMENT '目标贴的URL，通过该URL可以直接看到该帖子',
    `post_title` VARCHAR(128) COMMENT '帖子标题',
    `post_conent` VARCHAR(1024) COMMENT '主题帖内容',
    `post_author` VARCHAR(64) COMMENT '帖子作者帐号',
    `post_publish_time` VARCHAR(32) COMMENT '主题帖发送时间',
    `is_responsed` TINYINT COMMENT '是否进行了回复，0-没有， 1-已回复'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- 
-- 回帖任务相关信息
-- 
DROP TABLE IF EXISTS `tz_post_publish`;
CREATE TABLE `tz_post_publish` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `crawl_result_id` INT COMMENT '抓取结果ID，如果是发新贴则此字段为空',
    `post_template_id` INT COMMENT '所用的帖子内容模版',
    `post_title` VARCHAR(128) COMMENT '标题',
    `post_content` VARCHAR(1024) COMMENT '正文',
    `status` TINYINT COMMENT '发送状态，0-失败，1-成功',
    `url` VARCHAR(256) COMMENT '所发回帖的可引用URL',
    `publish_time` DATETIME COMMENT '发帖时间'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- 
-- 匹配主题帖内容的模版
-- 如果匹配，则说明该主题帖是目标贴，需要转发客户或者进行自动回帖
-- 
DROP TABLE IF EXISTS `tz_match_rule`;
CREATE TABLE `tz_match_rule` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(128) COMMENT '匹配标题的规则',
    `content` VARCHAR(128) COMMENT '匹配正文的规则',
    `status` TINYINT COMMENT '规则状态，1-正常使用中，2-删除',
    `created_at` DATETIME COMMENT '添加时间',
    `updated_at` DATETIME COMMENT '更新时间'
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

