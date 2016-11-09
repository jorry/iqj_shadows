/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */
var db = require('./dbhelper');

var HotFix = {};

module.exports = HotFix;
//app 的名字是用hashCode 为文件名,上传文件后,好像可以获取到文件的名字,然后文件的名字是hashCode, 文件名字后面拼接下载地址
//以后,要填写上传人名字,上传日期
HotFix.save = function (hashCode, fileName, fileSize,description, callback) {
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
            var app_id = 1;
            var version_name = "爱钱进";
            var appVersion = "4.9.3";
            sql = "INSERT INTO hotFix SET app_id=?,version_name=?,hashCode=?,appVersion=?,patch_size=?,file_hash=?,create_date=?,description=?,hotUrl=?";
            console.log('2-----进来了吗');
            connection.query(sql, [app_id,version_name,hashCode,appVersion,fileSize,fileName,date,description,"http://www.baidu.com"], function (err, rows) {
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

HotFix.getHotFixRows = function (callback) {
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            sql = "SELECT * FROM hotFix;";

            connection.query(sql, [], function (err, rows) {
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    });
                }

                connection.commit(function (err) {

                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }

                    connection.end();
                    callback(undefined,rows);

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