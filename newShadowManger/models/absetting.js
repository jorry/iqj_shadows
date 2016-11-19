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
    this.description;
};


// 根据appUid 和app版本,找到对应的 补丁列表
absetting.selectAllABsetting = function (hashCode, callback) {

    var obj = new response();
    sql = "SELECT count(atest) AS count FROM absetting WHERE atest = '0' and hashCode='" + hashCode + "';";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }

        obj.acount = rows[0].count;
        sql = "SELECT count(btest)  AS count  FROM absetting WHERE btest = '1' and hashCode='" + hashCode + "';";

        db.query(sql, function (err, rows, fields) {
            if (err) {
                return callback(err)
            }

            obj.bcount = rows[0].count;
            sql = "SELECT description FROM absetting WHERE hashCode='" + hashCode + "';";

            db.query(sql, function (err, rows, fields) {

                if (err) {
                    return callback(err)
                }
                obj.description = rows[0].description;

                console.log(obj.description);
                callback(undefined, obj);
            });
        });

    });
};