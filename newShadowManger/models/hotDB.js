/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */
var db = require('./dbhelper');

var HotFix = {};

module.exports = HotFix;
//app 的名字是用hashCode 为文件名,上传文件后,好像可以获取到文件的名字,然后文件的名字是hashCode, 文件名字后面拼接下载地址
//以后,要填写上传人名字,上传日期
// patch_status  0 未发布;1 已发布
// patch_type 1. 全量更新,2,灰度测试,4 全量更新H5交互引擎

HotFix.save = function (appId,appVersion,hotPathFilePatch,hashCode, fileName, fileSize, description, patch_status, patch_type, tags, callback) {
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

            var patchVersion ;
            sql = "SELECT id FROM hotFix GROUP BY id DESC";
            connection.query(sql,[],function(err,rows){
                if (err){
                    return connection.rollback(function () {
                        callback(err);
                    });
                }
                if (rows.length == 0){
                    patchVersion = 1;
                }else{
                    patchVersion = rows[0].id+1;
                }
                var iqianjin = 'iqianjin';
                console.log('---patchVersion---'+patchVersion)
                var date = new Date().Format("yyyy-MM-dd");
                sql = "INSERT INTO hotFix SET app_id ='"+appId+"',version_name='"+iqianjin+"',hashCode='"+hashCode+"',appVersion='"+appVersion+"',patch_size='"+fileSize+"',file_hash='"+fileName+"',create_date='"+date+"',description='"+description+"',hotUrl='"+hotPathFilePatch+"',patch_status='"+patch_status+"',patch_type='"+patch_type+"',tags='"+tags+"',patchVersion='"+patchVersion+"';";
                connection.query(sql, [], function (err) {
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
            })
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