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
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            sql = "SELECT * FROM hotFix WHERE app_id = '"+app_uid+"' and appVersion = '"+appVersion+"';";
            console.log('patchManager = '+sql);

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


HotFix.getHotFixRowsEmergency = function (callback) {
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            sql = "SELECT * FROM hotFix WHERE patch_type <> 1 and patch_type <> 0";

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


//应用名称,应用版本
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




//设置灰度功能,同一时间,只能有一个灰度
HotFix.graySetting = function (hashCode, appVersion, hotfixType, us, callback) {
    db.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        var sql;
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }

            sql = "SELECT * FROM graySetting";
            connection.query(sql,[],function(err,rows){

                if (err) {
                    return callback(err);
                }

                if (rows.length >= 1){
                    return callback('同一时间只能有一个灰度功能测试,请在灰度代码回滚界面查看相关信息');
                }

                var date = new Date().Format("yyyy-MM-dd");
                var revert = 1;
                var hotUrl = "http://172.20.30.66:8080/patch_signed_7zip.apk";

                console.log('graySetting ');
                //sql = "INSERT INTO graySetting (appVersion,hashCode,hotfixType,hotUrl,revert,us) VALUES ('" + appVersion + "','" + hashCode + "','" + hotfixType + "','"+ hotUrl+ "','" + revert + "','" + us + "');";

                connection.query("INSERT INTO graySetting SET appVersion=?,hashCode=?,hotfixType=?,hotUrl=?,revert=?,us=?", [appVersion, hashCode, hotfixType, hotUrl, revert, us], function (err, rows) {
                    console.log('graySetting = ' + err);
                    if (err) {
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    console.log('graySetting = ');
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
    });
}

//代码回滚的功能
//HotFix.revert_return = function (imei, callback) {
//    db.getConnection(function (err, connection) {
//        console.log('进入到revert 版本回滚 数据库');
//        if (err) {
//            return
//        }
//        connection.beginTransaction(function (err) {
//            if (err) {
//                callback(err);
//            }
//
//            sql = "UPDATE revert FROM hot WHERE  hasoCode = '" + imei + "';";
//            console.log('sql rever' + sql);
//            connection.query(sql, function (err, rows) {
//                console.log('进入到revert 数据库-查询结果: err ' + err + "   rows = " + rows);
//                if (err) {
//                    return connection.rollback(function () {
//                        callback(err);
//                    })
//                }
//                callback(undefined, rows);
//            })
//        })
//    });
//};

 //回滚列表
HotFix.hotReverListView = function (callback) {
    db.getConnection(function (err, connection) {
        console.log('进入到hotFix 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            sql = "SELECT hasoCode,hotFixType,revert FROM hot  WHERE hotFixType != 1 and hotFixType != 4 and revert = 1";

            console.log('进入到hotFix 数据库-查询语句是: ' + sql);
            connection.query(sql, function (err, rows) {
                console.log('进入到hotFix 数据库-查询结果: err ' + err + "   rows = " + rows);
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    })
                }
                connection.end;
                callback(undefined, rows);
            })
        })
    });
};


HotFix.addOneUserStep = function (callback) {
    db.getConnection(function (err, connection) {
        console.log('进入到hotFix 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            sql = "SELECT * FROM addOneUserStep ;";

            console.log('进入到hotFix 数据库-查询语句是: ' + sql);
            connection.query(sql, function (err, rows) {
                console.log('进入到hotFix 数据库-查询结果: err ' + err + "   rows = " + rows);
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    })
                }
                connection.end;
                callback(undefined, rows);
            })
        })
    });
};

//hashCode,hotFixType,revert,function(err,result){
//}

HotFix.addSaveHot = function (hashCode, hotFixType, revert, callback) {
    db.getConnection(function (err, connection) {
        console.log('进入到  getOneUserStep 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            sql = "INSERT INTO hot (hasoCode,hotFixType,revert) VALUES ('" + hashCode + "','" + hotFixType + "','" + revert + "');";
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
        })
    });
};


HotFix.getOneUserStep = function (imei, callback) {
    db.getConnection(function (err, connection) {
        console.log('进入到  getOneUserStep 数据库');
        if (err) {
            return
        }
        connection.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }

            var sql = "SELECT * FROM addOneUserStep WHERE imei = '" + imei + "';";

            console.log('进入到   addOneUserStep 数据库-查询语句是: ' + sql);
            connection.query(sql, function (err, rows) {
                console.log('进入到   addOneUserStep  数据库-查询结果: err ' + err + "   rows = " + rows);
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    })
                }
                console.log('进入到   addOneUserStep step: ' + rows[0].step);
                connection.end;
                callback(undefined, rows[0].step);
            })
        })
    });
};

HotFix.getHotFixResult = function (callback) {

    db.getConnection(function (err, connection) {
        if (err) {
            return;
        }
        connection.beginTransaction(function (err) {
            if (err) {
                return;
            }

            var sql = "SELECT distinct hashCode FROM hotfix ;";
            console.log('进入到   hotfix 数据库-查询语句是: ' + sql)
            connection.query(sql, function (err, rows) {
                console.log('进入到   hotfix  数据库-查询结果: err ' + err + "   rows = " + rows);
                if (err) {
                    return connection.rollback(function () {
                        callback(err);
                    });
                }
                connection.end;
                callback(undefined, rows);
            })
        });
    })
};

HotFix.getHotFixCountByHashCode = function(hashCode, callback) {
    db.getConnection(function (err, connection) {
        if (err) {
            return;
        }
        var sql = "SELECT COUNT(*) AS count FROM iqj_apphotfixstate where hashCodeApp = '"+hashCode+"' ;";
        console.log('进入到   iqj_apphotfixstate 数据库-查询语句是: ' + sql)
        connection.query(sql, function (err, rows) {
            console.log('进入到   iqj_apphotfixstate  数据库-查询结果: err ' + err + "   rows = " + rows);
            if (err) {
                return connection.rollback(function () {
                    callback(err);
                });
            }
            connection.end;
            callback(undefined, rows[0].count);
        })
    })
}

HotFix.getHotFixCountSuccess = function(hashCode, callback) {
    db.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        var sql = "SELECT COUNT(*) AS count FROM iqj_apphotfixstate where hashCodeApp = '"+hashCode+"' and appState = '1' ;";
        console.log('进入到   iqj_apphotfixstate 数据库-查询语句是: ' + sql)
        connection.query(sql, function (err, rows) {
            console.log('进入到   iqj_apphotfixstate  数据库-查询结果: err ' + err + "   rows = " + rows);
            if (err) {
                return connection.rollback(function () {
                    callback(err);
                });
            }
            connection.end;
            callback(undefined, rows[0].count);
        })
    })
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