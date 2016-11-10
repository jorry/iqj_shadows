/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */
var db = require('./dbhelper');

var HotFix = {};

module.exports = HotFix;
//app 的名字是用hashCode 为文件名,上传文件后,好像可以获取到文件的名字,然后文件的名字是hashCode, 文件名字后面拼接下载地址
//以后,要填写上传人名字,上传日期
// patch_status  0 未发布;1 已发布
// patch_type 1. 全量更新,2,灰度测试

HotFix.save = function (hashCode, fileName, fileSize, description, patch_status, patch_type, tags, callback) {
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
            var version_name = "iqianjin";
            var appVersion = "4.9.3";
            sql = "INSERT INTO hotFix SET app_id=?,version_name=?,hashCode=?,appVersion=?,patch_size=?,file_hash=?,create_date=?,description=?,hotUrl=?,patch_status=?,patch_type=?,tags=?";
            console.log('2-----进来了吗');
            connection.query(sql, [app_id, version_name, hashCode, appVersion, fileSize, fileName, date, description, hashCode, patch_status, patch_type, tags], function (err, rows) {
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


HotFix.managerHotFix = function (status, hashCode, callback) {
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (status == 0) {  //删除

                sql = "DELETE FROM hotFix WHERE hashCode = '" + hashCode + "';";

            } else if(status == 1 || status == 2){  //发布补丁
                sql = "UPDATE hotFix SET patch_status = 1  WHERE hashCode = '"+hashCode+"';";
            }else if (status == 3 || status == 4){
                sql = "UPDATE hotFix SET patch_status = 0  WHERE hashCode = '"+hashCode+"';";
            }

            console.log("sql = " + sql)
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
                    callback();

                });
            });
        });
    });
};


HotFix.getHotFixRow = function (hashCode, callback) {
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            sql = "SELECT * FROM hotFix WHERE hashCode = '" + hashCode + "';";

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
                    callback(undefined, rows[0]);

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
                    callback(undefined, rows);

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