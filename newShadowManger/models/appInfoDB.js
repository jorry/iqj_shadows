/**
 * Created by iqianjin-liujiawei on 16/11/11.
 */
var db = require('./dbhelper');

var appInfoDB = {};

module.exports = appInfoDB;

appInfoDB.selectAll = function(callback){
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

            sql = "SELECT * FROM appInfo;";
            console.log('2-----进来了吗');
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

appInfoDB.insertAppInfo = function(appName,platform,u_id,destination,callback){
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

            sql = "INSERT INTO appInfo SET appName=?,platfrom=?,uid=?,descriiption_app=?,create_at=?";
            console.log('2-----进来了吗');
            connection.query(sql, [appName, platform, u_id, destination, date], function (err, rows) {
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