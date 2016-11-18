/**
 * Created by iqianjin-liujiawei on 16/11/11.
 */
var db = require('./dbhelper');

var versionDB = {};

module.exports = versionDB;


versionDB.selectAll = function(appUid,callback){
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }
        console.log('1-----进来了吗');
        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            var date = new Date().Format("yyyy-MM-dd");
            console.log('日期函数:'+date);

            sql = "SELECT * FROM version_info WHERE app_uid= '"+appUid+"';";

            console.log('2-----进来了吗'+sql);
            connection.query(sql,[], function (err, rows) {
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    });
                }
                console.log('3-----进来了吗'+rows);
                connection.commit(function (err) {

                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    console.log('4-----进来了吗');
                    connection.end();
                    callback(undefined,rows);

                });
            });
        });
    });
};

versionDB.insertVersionDB = function(appId,version_name,callback){
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }
        console.log('1-----进来了吗');
        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            var date = new Date().Format("yyyy-MM-dd");//
            console.log('创建日期:'+date);

            sql = "INSERT INTO version_info SET app_uid=?,version_name=?,created_at=?;";
            console.log('2-----进来了吗');
            connection.query(sql, [appId, version_name, date], function (err, rows) {
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    });
                }
                console.log('3-----进来了吗');
                connection.commit(function (err) {

                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    console.log('4-----进来了吗');
                    connection.end();
                    callback();

                });
            });
        });
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

////格式化日期时间
//Date.prototype.Format = function(fmt) {
//    var o = {
//        "M+": this.getMonth() + 1,
//        "d+": this.getDate(),
//        "h+": this.getHours(),
//        "m+": this.getMinutes(),
//        "s+": this.getSeconds(),
//        "q+": Math.floor((this.getMonth() + 3) / 3),
//        "S": this.getMilliseconds()
//    };
//    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//    for (var k in o)
//        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//    return fmt;
//}