/**
 * Created by iqianjin-liujiawei on 16/11/18.
 */
var fs = require('fs');
var querystring = require('querystring');
var db = require('./dbhelper');

function absetting() {
}

module.exports = absetting;

var response = function () {
    this.acount;
    this.bcount;
    this.deiscriton;
};


// 根据appUid 和app版本,找到对应的 补丁列表
absetting.selectAllABsetting = function (hashCode, callback) {
    db.getConnection(function (err, connection) {
        if (err) {
            return callback(err);
        }
        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }
            var obj = new response();
            sql = "SELECT count(atest) AS count FROM absetting WHERE atest = '0' and hashCode='" + hashCode + "';";
            console.log(sql);
            connection.query(sql, [], function (err, rows) {
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    });
                }

                obj.acount = rows[0].count;
                sql = "SELECT count(btest)  AS count  FROM absetting WHERE btest = '1' and hashCode='" + hashCode + "';";
                connection.query(sql, [], function (err, rows) {
                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    obj.bcount =  rows[0].count;;
                    sql = "SELECT description FROM absetting WHERE hashCode='" + hashCode + "';";
                    console.log(sql);
                    connection.query(sql, [], function (err, rows) {
                        if (err) {
                            return connection.rollback(function () {
                                callback(err);
                            });
                        }
                        if (rows[0].deiscriton) {
                            obj.deiscriton = rows[0].description;
                        }


                        console.log(obj.acount, obj.bcount.count, obj.deiscriton);
                        connection.commit(function (err) {

                            if (err) {
                                return connection.rollback(function () {
                                    callback(err);
                                });
                            }
                            connection.end();
                            callback(undefined, obj);
                        });
                    });

                });
            });
        });
    });
};