/**
 * Created by iqianjin-liujiawei on 16/11/11.
 */
var db = require('./dbhelper');
var versionDB = require('./versionDB');
var appInfoDB = {};

module.exports = appInfoDB;

appInfoDB.getAppDetail = function (appUid, callback) {
    sql = "SELECT appName,platfrom,uid,descriiption_app,create_at FROM appInfo WHERE uid='" + appUid + "';";
    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);
    });
};

appInfoDB.selectAll = function (callback) {
    var sql = "SELECT * FROM appInfo;";
    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);
    });
};

appInfoDB.insertAppInfo = function (appName, platform, u_id, destination, callback) {

    var date = new Date().Format("yyyy-MM-dd");

    var sql = "INSERT INTO appInfo SET appName='" + appName + "',platfrom='" + platform + "',uid='" + u_id + "',descriiption_app='" + destination + "',create_at='" + date + "'";
    console.log(sql);

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);
    });

};


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