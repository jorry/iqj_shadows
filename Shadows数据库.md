
### 数据库

* 统计补丁（任何类型的补丁，都需要添加到此数据库中，以便回滚）  此数据库用于提交补丁和 代码回滚功能

		id            自增
		hashCode      补丁版本
		hotFixType    补丁类型
		revert        代码是否回滚（如果是 ab，单用户，灰度功能类型有此字段） 可为空   1. 不回滚，2 回滚
		


* 获取补丁接口(hotFix)

		id 自增
		hashCode      补丁ID
		appVersion    app 版本
		hotFixType    补丁修复类型（1=全量修复；2=根据版本修复）
		uploadDate    版本日期
		hotUrl        补丁下载地址
		imei          //待补充    设备ID
		
* 用户修复后状态上传的接口（appHotFixState）
     
     	id            自增
    	imei          设备ID
    	appState      修复状态（1 成功，-1 失败）
    	hotPushType   修复类型（1 全量更新）
    	hashCode      //补丁ID，   待补充，修复完成后，需要对应的文件名，统计使用

* 单用户行为上传(addOneUserStep)
	
		id            自增
		imei          ID
		appVersion    app版本
		osVersion     用户手机版本
		net           用户当前网络
		step          用户行为
		
		
		
回滚接口： 根据用户提交的hashCode 判断 是否为个别用户。如果是个别用户，要验证是否需要代码回滚

代码回滚，数据库

---
####SQL

补丁包统一数据库
   
	CREATE TABLE hot(  
	   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	   hasoCode VARCHAR(200) NOT NULL UNIQUE,
	   hotFixType VARCHAR (50) NOT NULL UNIQUE,
	   revert 	CHAR(1)
	);

热修复数据库   hashCode == 文件名 == hotUrl （hotUrl 拼接服务器地址）
	
	CREATE TABLE hotFix(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		app_id VARCHAR(32),
	    version_name VARCHAR(32),
        hashCode VARCHAR(200) NOT NULL UNIQUE,
        appVersion VARCHAR(0),
		patch_status CHAR(1),             // 0 未发布  1. 已发布
		patch_type CHAR(1),               // 0是全量，1 是灰度；4 引擎
	    patch_size LONG,
		file_hash VARCHAR(64),		
		create_date VARCHAR(64),
	 	description VARCHAR(50),
        hotUrl VARCHAR(300)
    );

灰度功能测试的数据库

	CREATE TABLE hotFix(
       id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,//主键
       hashCode VARCHAR(10) NOT NULL UNIQUE,//hashCode
       appVersion VARCHAR(200) NOT NULL,  //app版本
       hotfixType  CHAR(1) NOT NULL,//修复类型
       hotUrl VARCHAR
    );
    
灰度测试

 	INSERT INTO graySetting (appVersion,hashCode,hotfixType,hotUrl,revert,us)
   VALUES ('5.0.0','200000','2','','2','77');