/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */
var db = require('./dbhelper');

var HotFix = {};

module.exports = HotFix;
//app 的名字是用hashCode 为文件名,上传文件后,好像可以获取到文件的名字,然后文件的名字是hashCode, 文件名字后面拼接下载地址
//以后,要填写上传人名字,上传日期

// 根据appUid 和app版本,找到对应的 补丁列表
HotFix.patchManager = function (app_uid,appVersion,callback) {

    var sql = "SELECT * FROM appHotFix WHERE app_id = '"+app_uid+"' and appVersion = '"+appVersion+"';";
    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined,rows);

    });
};


HotFix.getHotFixRowsEmergency = function (callback) {

    var  sql = "SELECT * FROM appHotFix WHERE patch_type <> 1 and patch_type <> 0";
    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined,rows);

    });
};


//应用名称,应用版本
HotFix.getHotFixRows = function (callback) {

    var   sql = "SELECT * FROM appHotFix;";
    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined,rows);

    });
};


 //回滚列表
HotFix.hotReverListView = function (callback) {

    var sql = "SELECT hasoCode,hotFixType,revert FROM hot  WHERE hotFixType != 1 and hotFixType != 4 and revert = 1";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);

    });

};


HotFix.addOneUserStep = function (callback) {

    var   sql = "SELECT * FROM addOneUserStep ;";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);

    });
};

//hashCode,hotFixType,revert,function(err,result){
//}

HotFix.addSaveHot = function (hashCode, hotFixType, revert, callback) {

    var  sql = "INSERT INTO hot (hasoCode,hotFixType,revert) VALUES ('" + hashCode + "','" + hotFixType + "','" + revert + "');";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback();

    });
};


HotFix.getOneUserStep = function (imei, callback) {

    var sql = "SELECT * FROM addOneUserStep WHERE id = '" + imei + "';";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows[0].step);

    });
};

HotFix.getHotFixResult = function (callback) {

    var sql = "SELECT distinct hashCode FROM appHotFix ;";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);

    });
};

HotFix.getHotFixCountByHashCode = function(hashCode, callback) {

    var sql = "SELECT COUNT(*) AS count FROM iqj_apphotfixstate where hashCodeApp = '"+hashCode+"' ;";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows[0].count);

    });
}

HotFix.getHotFixCountSuccess = function(hashCode, callback) {

    var sql = "SELECT COUNT(*) AS count FROM iqj_apphotfixstate where hashCodeApp = '"+hashCode+"' and appState = '1' ;";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows[0].count);

    });
}


//日期格式化函数
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate() //日

    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};