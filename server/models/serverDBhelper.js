/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */

var db = require('./dbhelper');
function hotPatch() {
    this.version;
}

module.exports = hotPatch;

hotPatch.selectPatchVersion = function (appId,callback) {
    db.getConnection(function (err, connection) {
        console.log('进入到hotFix 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            var sql = "SELECT * FROM hotFix WHERE patch_status = '1'  and app_id='"+appId+"' ORDER BY id DESC;";   // patch_type = 0 表示灰度,patch_status = 1 表示已发布

            console.log('进入到hotFix 数据库-查询语句是: ' + sql);
            connection.query(sql, function (err, rows) {
                console.log('进入到hotFix 数据库-查询结果: err ' + err + "   rows = " + rows);
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    })
                }
                callback(undefined, rows);
            })
        })
    });
}
hotPatch.getH5HotFix = function(callBack){
    db.getConnection(function (err, connection) {
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            sql = "SELECT hotUrl FROM hotfix ORDER BY id DESC;";
            connection.query(sql,[], function (err, rows) {

                if (err) {
                    return connection.rollback(function (err) {
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
                    callBack(undefined,rows);
                });
            })
        })
    });
}
// 存储app修复的状态  imei  appState  hotPushType
hotPatch.appHotFixState = function (imei, appState, hotPushType, callBack) {
    db.getConnection(function (err, connection) {
        console.log('进入到addUserPosition 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            sql = "INSERT INTO iqj_appHotFixState set imei=?,appState=?,hotPushType=?;";

            console.log('进入到addUserPosition 数据库-查询语句是: ' + sql);
            connection.query(sql,[imei,appState,hotPushType], function (err, rows) {
                console.log('进入到addUserPositio 数据库-查询结果: err ' + err + "   rows = " + rows);

                if (err) {
                    return connection.rollback(function (err) {
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
                    callBack();
                });
            })
        })
    });

}

hotPatch.graySetting = function (callBack) {
    db.getConnection(function (err, connection) {
        if (err) {
            return;
        }
        connection.beginTransaction(function (err) {
            if (err) {
                return callBack(err);
            }
            var sql = "SELECT * FROM hotFix WHERE patch_type = '0' and patch_status = '1';";   // 0 表示灰度,1 表示已发布
            connection.query(sql, function (err, rows) {
                if (err) {
                    return connection.rollback(function (err) {
                        callback();
                    });
                }
                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    connection.end();
                    callBack(undefined, rows);
                });

            });
        });
    });
}

// 存储单用户行为
hotPatch.addOneUserStep = function (imei, appVersion, osVersion, net, step, callBack) {
    db.getConnection(function (err, connection) {
        console.log('进入到addOneUserStep 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            var sql = "INSERT INTO addOneUserStep (imei,appVersion,osVersion,net,step) VALUES ('" + imei + "','" + appVersion + "','" + osVersion + "','" + net + "','" + step + "')";

            console.log('进入到addOneUserStep 数据库-查询语句是: ' + sql);
            connection.query(sql, function (err, rows) {
                console.log('进入到addUserPositio 数据库-查询结果: err ' + err + "   rows = " + rows);

                if (err) {
                    return connection.rollback(function (err) {
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
                    callBack();
                });
            })
        })
    });

}